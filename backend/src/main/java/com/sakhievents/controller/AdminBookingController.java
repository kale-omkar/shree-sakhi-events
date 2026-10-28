package com.sakhievents.controller;

import com.sakhievents.dto.ApiResponse;
import com.sakhievents.dto.BookingResponseDTO;
import com.sakhievents.dto.BookingStatusUpdateDTO;
import com.sakhievents.exception.UnauthorizedException;
import com.sakhievents.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

/**
 * Admin booking endpoints — Jatin Patil's module.
 * Protected by X-Admin-Key header with secure fail-closed authentication.
 */
@RestController
@RequestMapping("/api/admin/bookings")
@CrossOrigin(
    origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PATCH,
               RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class AdminBookingController {

    private final BookingService bookingService;
    private final String adminApiKey;

    public AdminBookingController(BookingService bookingService) {
        this(bookingService, System.getProperty("admin.api.key", ""));
    }

    @Autowired
    public AdminBookingController(
            BookingService bookingService,
            @Value("${admin.api.key:}") String adminApiKey) {
        this.bookingService = bookingService;
        this.adminApiKey = adminApiKey;
    }

    /**
     * GET /api/admin/bookings?eventId=1&status=PENDING
     * List all bookings with optional filter by eventId and/or status.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getAllBookings(
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey,
            @RequestParam(required = false) Long eventId,
            @RequestParam(required = false) String status) {

        validateAdminKey(adminKey);
        List<BookingResponseDTO> bookings = bookingService.getAllBookings(eventId, status);
        return ResponseEntity.ok(ApiResponse.success(
                "Bookings fetched successfully (" + bookings.size() + " records)", bookings));
    }

    /**
     * PATCH /api/admin/bookings/{id}
     * Update booking status (PENDING → CONFIRMED / CANCELLED) and optionally payment status.
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> updateBookingStatus(
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey,
            @PathVariable Long id,
            @Valid @RequestBody BookingStatusUpdateDTO dto) {

        validateAdminKey(adminKey);
        BookingResponseDTO updated = bookingService.updateBookingStatus(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated successfully", updated));
    }

    // ─── Secure Admin Key Validation ──────────────────────────────────────────

    private boolean isValidAdminKey(String key) {
        String configuredKey = (adminApiKey != null && !adminApiKey.isBlank())
                ? adminApiKey
                : System.getProperty("admin.api.key");

        // Fail-safe: if admin API key is unconfigured or blank, deny all access
        if (configuredKey == null || configuredKey.isBlank()) {
            return false;
        }

        if (key == null || key.isBlank()) {
            return false;
        }

        // Constant-time comparison to mitigate timing attacks
        return MessageDigest.isEqual(
                configuredKey.getBytes(StandardCharsets.UTF_8),
                key.getBytes(StandardCharsets.UTF_8)
        );
    }

    private void validateAdminKey(String key) {
        if (!isValidAdminKey(key)) {
            throw new UnauthorizedException("Unauthorised: invalid or missing admin API key");
        }
    }
}
