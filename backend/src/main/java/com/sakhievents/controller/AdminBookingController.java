package com.sakhievents.controller;

import com.sakhievents.dto.ApiResponse;
import com.sakhievents.dto.BookingResponseDTO;
import com.sakhievents.dto.BookingStatusUpdateDTO;
import com.sakhievents.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin booking endpoints — Jatin Patil's module.
 * Protected by X-Admin-Key header — consistent with existing AdminEventController pattern.
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

    @Autowired
    private BookingService bookingService;

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

    // ─── Admin key validation — same pattern as AdminEventController ──────────

    private static final String ADMIN_API_KEY =
            System.getProperty("admin.api.key", "sakhi-admin-2026");

    private void validateAdminKey(String key) {
        if (key == null || !key.equals(ADMIN_API_KEY)) {
            throw new RuntimeException("Unauthorised: invalid or missing admin API key");
        }
    }
}
