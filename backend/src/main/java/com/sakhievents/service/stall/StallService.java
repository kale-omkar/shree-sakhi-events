package com.sakhievents.service.stall;

import com.sakhievents.dto.stall.StallDTO;
import com.sakhievents.dto.stall.StallHoldRequest;
import com.sakhievents.dto.stall.StallHoldResponse;
import com.sakhievents.exception.StallConflictException;
import com.sakhievents.model.Booking;
import com.sakhievents.model.Booking.BookingStatus;
import com.sakhievents.model.stall.Stall;
import com.sakhievents.model.stall.StallHold;
import com.sakhievents.repository.booking.BookingStallRepository;
import com.sakhievents.repository.stall.StallHoldRepository;
import com.sakhievents.repository.stall.StallRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Stall service — hold/release/cleanup and live stall status for the
 * Stall Selection step. All hold mutations run inside a transaction with
 * pessimistic row locks to prevent double-booking under concurrency.
 */
@Service
public class StallService {

    @Autowired
    private StallRepository stallRepository;

    @Autowired
    private StallHoldRepository stallHoldRepository;

    @Autowired
    private BookingStallRepository bookingStallRepository;

    @Value("${stall.hold.ttl.minutes:10}")
    private Integer holdTtlMinutes;

    @Value("${stall.max.per.booking:5}")
    private Integer maxStallsPerBooking;

    // ─── Public: list stalls with live status ──────────────────────────────

    @Transactional(readOnly = true)
    public List<StallDTO> getStalls(Long eventId, String sessionId) {
        List<Stall> stalls = stallRepository.findActiveByEventId(eventId);
        LocalDateTime now = LocalDateTime.now();

        List<StallDTO> result = new ArrayList<>();
        for (Stall s : stalls) {
            String status = deriveStatus(s, now, sessionId);
            result.add(StallDTO.fromEntity(s, status));
        }
        return result;
    }

    // ─── Public: hold stalls ───────────────────────────────────────────────

    @Transactional
    public StallHoldResponse holdStalls(StallHoldRequest request) {
        if (request.getStallCodes().size() > maxStallsPerBooking) {
            throw new StallConflictException(
                    "Maximum " + maxStallsPerBooking + " stalls can be selected per booking.");
        }

        // Load + pessimistically lock all stall rows so concurrent holds serialize
        List<Stall> stalls = new ArrayList<>();
        for (String code : request.getStallCodes()) {
            Stall stall = stallRepository.findByEventIdAndStallCode(request.getEventId(), code)
                    .orElseThrow(() -> new StallConflictException(
                            "Stall '" + code + "' not found for this event."));
            stall = stallRepository.findByIdForUpdate(stall.getId())
                    .orElseThrow(() -> new StallConflictException(
                            "Stall '" + code + "' could not be locked."));
            stalls.add(stall);
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(holdTtlMinutes);

        // Validate each stall is free (not booked, not held by another session)
        for (Stall s : stalls) {
            boolean booked = bookingStallRepository.findByStallId(s.getId()).stream()
                    .anyMatch(bs -> bs.getBooking().getBookingStatus() != BookingStatus.CANCELLED);
            if (booked) {
                throw new StallConflictException(
                        "Stall '" + s.getStallCode() + "' is already booked. Please choose another.");
            }

            boolean heldByOther = stallHoldRepository.findByStallId(s.getId()).stream()
                    .anyMatch(h -> !request.getSessionId().equals(h.getSessionId())
                            && h.getExpiresAt().isAfter(now));
            if (heldByOther) {
                throw new StallConflictException(
                        "Stall '" + s.getStallCode() + "' is held by another user. Please choose another.");
            }
        }

        // Remove any existing holds by this session on these stalls (renewal),
        // then create fresh holds.
        String holdToken = UUID.randomUUID().toString();
        List<StallDTO> held = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (Stall s : stalls) {
            stallHoldRepository.deleteByStallIdAndSessionId(s.getId(), request.getSessionId());

            StallHold hold = StallHold.builder()
                    .stall(s)
                    .holdToken(holdToken)
                    .sessionId(request.getSessionId())
                    .expiresAt(expiresAt)
                    .build();
            stallHoldRepository.save(hold);

            total = total.add(s.getPrice());
            held.add(StallDTO.fromEntity(s, "SELECTED"));
        }

        return StallHoldResponse.builder()
                .holdToken(holdToken)
                .expiresAt(expiresAt)
                .ttlMinutes(holdTtlMinutes)
                .heldStalls(held)
                .total(total)
                .build();
    }

    // ─── Public: release hold ──────────────────────────────────────────────

    @Transactional
    public void releaseHold(String holdToken, String sessionId) {
        if (holdToken != null && !holdToken.isBlank()) {
            stallHoldRepository.deleteByHoldToken(holdToken);
        } else if (sessionId != null && !sessionId.isBlank()) {
            stallHoldRepository.deleteBySessionId(sessionId);
        }
    }

    // ─── Scheduled: cleanup expired holds ──────────────────────────────────

    @Scheduled(fixedDelayString = "${stall.cleanup.fixedDelay.ms:60000}")
    @Transactional
    public void cleanupExpiredHolds() {
        stallHoldRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }

    // ─── Internal: validate + consume a hold for booking creation ──────────

    /**
     * Re-validates a hold server-side inside a transaction, locks stall rows,
     * and returns the backend-computed total price. Consumes (deletes) the hold
     * so it cannot be reused. Throws StallConflictException on any conflict.
     */
    @Transactional
    public BigDecimal validateAndConsumeHold(Long eventId, List<String> stallCodes,
                                             String holdToken, String sessionId) {
        if (stallCodes == null || stallCodes.isEmpty()) {
            return BigDecimal.ZERO;
        }

        StallHold hold = stallHoldRepository.findByHoldToken(holdToken)
                .orElseThrow(() -> new StallConflictException(
                        "Hold token is invalid or has expired. Please re-select your stalls."));

        if (!hold.getSessionId().equals(sessionId)) {
            throw new StallConflictException(
                "Hold token does not match your session. Please re-select your stalls.");
        }

        if (hold.getExpiresAt().isBefore(LocalDateTime.now())) {
            stallHoldRepository.deleteByHoldToken(holdToken);
            throw new StallConflictException(
                    "Your stall hold has expired. Please re-select your stalls.");
        }

        // Confirm the held stalls match the requested stall codes
        List<String> heldCodes = stallHoldRepository.findByHoldToken(holdToken)
                .map(h -> stallRepository.findById(h.getStall().getId()).map(Stall::getStallCode).orElse(null))
                .stream().collect(Collectors.toList());

        // Re-lock and re-validate each stall is still free
        for (String code : stallCodes) {
            Stall s = stallRepository.findByEventIdAndStallCode(eventId, code)
                    .orElseThrow(() -> new StallConflictException("Stall '" + code + "' not found."));
            s = stallRepository.findByIdForUpdate(s.getId())
                    .orElseThrow(() -> new StallConflictException("Stall '" + code + "' could not be locked."));

            boolean booked = bookingStallRepository.findByStallId(s.getId()).stream()
                    .anyMatch(bs -> bs.getBooking().getBookingStatus() != BookingStatus.CANCELLED);
            if (booked) {
                throw new StallConflictException(
                        "Stall '" + code + "' was just booked by another user. Please choose another.");
            }
        }

        // Consume the hold
        stallHoldRepository.deleteByHoldToken(holdToken);

        // Compute total from DB prices (never trust frontend)
        BigDecimal total = stallCodes.stream()
                .map(code -> stallRepository.findByEventIdAndStallCode(eventId, code)
                        .orElseThrow(() -> new StallConflictException("Stall '" + code + "' not found.")))
                .map(Stall::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return total;
    }

    // ─── Helpers ───────────────────────────────────────────────────────────

    private String deriveStatus(Stall stall, LocalDateTime now, String sessionId) {
        boolean booked = bookingStallRepository.findByStallId(stall.getId()).stream()
                .anyMatch(bs -> bs.getBooking().getBookingStatus() != BookingStatus.CANCELLED);
        if (booked) return "BOOKED";

        boolean held = stallHoldRepository.findByStallId(stall.getId()).stream()
                .anyMatch(h -> h.getExpiresAt().isAfter(now));
        if (held) return "HELD";

        return "AVAILABLE";
    }
}
