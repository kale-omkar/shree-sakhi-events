package com.sakhievents.service;

import com.sakhievents.dto.BookingRequestDTO;
import com.sakhievents.dto.BookingResponseDTO;
import com.sakhievents.dto.BookingStatusUpdateDTO;
import com.sakhievents.dto.stall.StallDTO;
import com.sakhievents.model.Booking;
import com.sakhievents.model.Booking.BookingStatus;
import com.sakhievents.model.Event;
import com.sakhievents.model.booking.BookingStall;
import com.sakhievents.model.stall.Stall;
import com.sakhievents.payment.PaymentResult;
import com.sakhievents.payment.PaymentService;
import com.sakhievents.repository.BookingRepository;
import com.sakhievents.repository.booking.BookingStallRepository;
import com.sakhievents.repository.EventRepository;
import com.sakhievents.repository.stall.StallRepository;
import com.sakhievents.service.stall.StallService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Booking service — Jatin Patil's module.
 * Handles create, status-check, payment flow, and admin operations.
 * Extended with stall selection support.
 */
@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EventRepository eventRepository;   // reuse existing repo — no duplication

    @Autowired
    private BookingStallRepository bookingStallRepository; // new: booking-stall junction

    @Autowired
    private StallRepository stallRepository;   // new: stall lookups

    @Autowired
    private StallService stallService;         // new: stall hold validation

    @Autowired
    private PaymentService paymentService;

    // ─── Public: Create Booking ───────────────────────────────────────────────

    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO dto) {

        // 1. Validate event exists
        Event event = eventRepository.findById(dto.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + dto.getEventId()));

        // 2. Reject bookings for past events
        if (event.getEventType() == Event.EventType.PAST) {
            throw new RuntimeException("Bookings are not allowed for past events.");
        }

        // 3. Check registration/booking status
        if (event.getRegistrationStatus() == Event.RegistrationStatus.CLOSED) {
            throw new RuntimeException("Bookings are currently closed for this event.");
        }
        if (event.getRegistrationStatus() == Event.RegistrationStatus.COMING_SOON) {
            throw new RuntimeException("Bookings for this event will open soon. Please check back later.");
        }

        // 4. Duplicate booking guard — one booking per email per event
        if (bookingRepository.existsByEventIdAndEmailIgnoreCase(dto.getEventId(), dto.getEmail())) {
            throw new RuntimeException(
                    "A booking already exists for '" + dto.getEmail() + "' for this event. " +
                    "Use the 'Check Booking Status' page to view your existing booking.");
        }

        // 5. Capacity check (if configured on the event)
        if (event.getMaxCapacity() != null && event.getMaxCapacity() > 0) {
            long active = bookingRepository.countActiveByEventId(dto.getEventId());
            if (active >= event.getMaxCapacity()) {
                throw new RuntimeException("Sorry! This event has reached full capacity.");
            }
        }

        // 6. Stall selection handling (EXHIBITOR / SPONSOR)
        List<String> stallCodes = dto.getStallCodes() != null ? dto.getStallCodes() : List.of();
        boolean requiresStalls = dto.getBookerType() == Booking.BookerType.EXHIBITOR
                || dto.getBookerType() == Booking.BookerType.SPONSOR;

        if (requiresStalls && stallCodes.isEmpty()) {
            throw new RuntimeException(
                    "At least one stall must be selected for " + dto.getBookerType() + " bookings.");
        }

        BigDecimal stallTotal = BigDecimal.ZERO;
        if (!stallCodes.isEmpty()) {
            // Re-validate hold server-side inside this transaction (locks stall rows),
            // computes the backend-calculated total from DB prices, consumes the hold.
            stallTotal = stallService.validateAndConsumeHold(
                    dto.getEventId(), stallCodes, dto.getHoldToken(), dto.getSessionId());
        }

        // 7. Generate sequential booking reference: SSE-<YEAR>-<NNNN>
        long total = bookingRepository.countAll();
        String bookingRef = String.format("SSE-%d-%04d", Year.now().getValue(), total + 1);

        // 8. Build and persist booking
        Booking booking = new Booking();
        booking.setBookingRef(bookingRef);
        booking.setEvent(event);
        booking.setBookerType(dto.getBookerType());
        booking.setFullName(dto.getFullName());
        booking.setCompany(dto.getCompany());
        booking.setPhone(dto.getPhone());
        booking.setEmail(dto.getEmail());
        booking.setQuantity(requiresStalls && !stallCodes.isEmpty() ? stallCodes.size() : dto.getQuantity());
        booking.setMessage(dto.getMessage());
        booking.setBookingStatus(Booking.BookingStatus.PENDING);
        booking.setPaymentStatus(Booking.PaymentStatus.NOT_REQUIRED);
        // Amount computed on the backend from DB stall prices — never trust frontend amount
        booking.setAmount(stallTotal);

        Booking saved = bookingRepository.save(booking);

        // 9. Persist booking-stall links (snapshot price at booking time)
        if (!stallCodes.isEmpty()) {
            for (String code : stallCodes) {
                Stall stall = stallRepository.findByEventIdAndStallCode(dto.getEventId(), code)
                        .orElseThrow(() -> new RuntimeException("Stall '" + code + "' not found."));
                BookingStall bs = BookingStall.builder()
                        .booking(saved)
                        .stall(stall)
                        .priceAtBooking(stall.getPrice())
                        .build();
                bookingStallRepository.save(bs);
            }
        }

        BookingResponseDTO response = BookingResponseDTO.fromEntity(saved);
        response.setStallCodes(stallCodes);
        if (!stallCodes.isEmpty()) {
            response.setBookedStalls(stallCodes.stream()
                    .map(code -> {
                        Stall s = stallRepository.findByEventIdAndStallCode(dto.getEventId(), code)
                                .orElseThrow(() -> new RuntimeException("Stall '" + code + "' not found."));
                        return StallDTO.builder()
                                .id(s.getId())
                                .stallCode(s.getStallCode())
                                .stallType(s.getStallType() != null ? s.getStallType().name() : null)
                                .sizeLabel(s.getSizeLabel())
                                .price(s.getPrice())
                                .posX(s.getPosX())
                                .posY(s.getPosY())
                                .width(s.getWidth())
                                .height(s.getHeight())
                                .status("BOOKED")
                                .isActive(s.getIsActive())
                                .build();
                    })
                    .collect(Collectors.toList()));
        }
        return response;
    }

    // ─── Public: Status Check ─────────────────────────────────────────────────

    public BookingResponseDTO getBookingStatus(String bookingRef, String email) {
        return bookingRepository.findByBookingRefAndEmailIgnoreCase(bookingRef, email)
                .map(BookingResponseDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException(
                        "No booking found for reference '" + bookingRef + "' with email '" + email + "'. "
                        + "Please check your details and try again."));
    }

    // ─── Admin: List Bookings ─────────────────────────────────────────────────

    public List<BookingResponseDTO> getAllBookings(Long eventId, String status) {
        List<Booking> bookings;

        if (eventId != null && status != null) {
            Booking.BookingStatus bs = parseStatus(status);
            bookings = bookingRepository.findByEventIdAndBookingStatus(eventId, bs);
        } else if (eventId != null) {
            bookings = bookingRepository.findByEventIdOrderByCreatedAtDesc(eventId);
        } else if (status != null) {
            Booking.BookingStatus bs = parseStatus(status);
            bookings = bookingRepository.findByBookingStatusOrderByCreatedAtDesc(bs);
        } else {
            bookings = bookingRepository.findAllOrderByCreatedAtDesc();
        }

        List<BookingResponseDTO> dtos = bookings.stream()
                .map(BookingResponseDTO::fromEntity)
                .collect(Collectors.toList());

        // Enrich with booked stalls so the admin list/detail shows stalls + total
        if (!dtos.isEmpty()) {
            List<Long> bookingIds = dtos.stream().map(BookingResponseDTO::getId).collect(Collectors.toList());
            List<BookingStall> links = bookingStallRepository.findByBookingIdIn(bookingIds);

            java.util.Map<Long, List<BookingStall>> byBooking = links.stream()
                    .collect(Collectors.groupingBy(bs -> bs.getBooking().getId()));

            for (BookingResponseDTO dto : dtos) {
                List<BookingStall> bLinks = byBooking.get(dto.getId());
                if (bLinks != null && !bLinks.isEmpty()) {
                    List<String> codes = new ArrayList<>();
                    List<StallDTO> stallDtos = new ArrayList<>();
                    for (BookingStall bs : bLinks) {
                        Stall s = bs.getStall();
                        codes.add(s.getStallCode());
                        stallDtos.add(StallDTO.builder()
                                .id(s.getId())
                                .stallCode(s.getStallCode())
                                .stallType(s.getStallType() != null ? s.getStallType().name() : null)
                                .sizeLabel(s.getSizeLabel())
                                .price(s.getPrice())
                                .posX(s.getPosX())
                                .posY(s.getPosY())
                                .width(s.getWidth())
                                .height(s.getHeight())
                                .status("BOOKED")
                                .isActive(s.getIsActive())
                                .build());
                    }
                    dto.setStallCodes(codes);
                    dto.setBookedStalls(stallDtos);
                }
            }
        }

        return dtos;
    }

    // ─── Admin: Update Booking Status ─────────────────────────────────────────

    @Transactional
    public BookingResponseDTO updateBookingStatus(Long id, BookingStatusUpdateDTO dto) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));

        BookingStatus previous = booking.getBookingStatus();
        booking.setBookingStatus(dto.getBookingStatus());
        if (dto.getPaymentStatus() != null)   booking.setPaymentStatus(dto.getPaymentStatus());
        if (dto.getPaymentReference() != null) booking.setPaymentReference(dto.getPaymentReference());

        Booking saved = bookingRepository.save(booking);

        // If cancelled, release its stalls so they become bookable again
        if (previous != BookingStatus.CANCELLED && booking.getBookingStatus() == BookingStatus.CANCELLED) {
            bookingStallRepository.deleteByBookingId(saved.getId());
        }

        return BookingResponseDTO.fromEntity(saved);
    }

    // ─── Payment Flow ─────────────────────────────────────────────────────────

    @Transactional
    public PaymentResult initiatePayment(String bookingRef) {
        Booking booking = bookingRepository.findByBookingRef(bookingRef)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingRef));

        if (booking.getBookingStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Cannot initiate payment for a cancelled booking.");
        }

        String description = "Booking " + bookingRef + " — "
                + (booking.getEvent() != null ? booking.getEvent().getName() : "Shree Sakhi Events");

        PaymentResult result = paymentService.initiatePayment(bookingRef, booking.getAmount(), description);

        if (result.isSuccess()) {
            booking.setPaymentStatus(Booking.PaymentStatus.PENDING);
            booking.setPaymentReference(result.getReference());
            bookingRepository.save(booking);
        }

        return result;
    }

    /**
     * Confirms payment — MUST be called from the backend after gateway callback.
     * Frontend success screen alone must NOT call this; always verify signature here first.
     */
    @Transactional
    public BookingResponseDTO confirmPayment(String bookingRef, String paymentReference, String signature) {
        Booking booking = bookingRepository.findByBookingRef(bookingRef)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingRef));

        // Backend verifies the signature before marking PAID
        boolean verified = paymentService.verifyPayment(bookingRef, paymentReference, signature);

        if (!verified) {
            booking.setPaymentStatus(Booking.PaymentStatus.FAILED);
            bookingRepository.save(booking);
            throw new RuntimeException(
                    "Payment verification failed. Please contact support with reference: " + paymentReference);
        }

        booking.setPaymentStatus(Booking.PaymentStatus.PAID);
        booking.setPaymentReference(paymentReference);
        booking.setBookingStatus(Booking.BookingStatus.CONFIRMED);

        return BookingResponseDTO.fromEntity(bookingRepository.save(booking));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Booking.BookingStatus parseStatus(String status) {
        try {
            return Booking.BookingStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid booking status: '" + status
                    + "'. Valid values: PENDING, CONFIRMED, CANCELLED");
        }
    }
}
