package com.sakhievents.controller;

import com.sakhievents.dto.ApiResponse;
import com.sakhievents.dto.BookingRequestDTO;
import com.sakhievents.dto.BookingResponseDTO;
import com.sakhievents.payment.PaymentResult;
import com.sakhievents.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Public booking endpoints — Jatin Patil's module.
 * No admin key required. Public status check requires both ref + email.
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    /**
     * POST /api/bookings
     * Create a new booking. Returns booking reference on success.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponseDTO>> createBooking(
            @Valid @RequestBody BookingRequestDTO dto) {

        BookingResponseDTO response = bookingService.createBooking(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Booking submitted successfully! Your reference: " + response.getBookingRef(),
                        response));
    }

    /**
     * GET /api/bookings/status?ref=SSE-2026-0001&email=user@email.com
     * Public status check — requires ref + email (no other user's data exposed).
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> getBookingStatus(
            @RequestParam String ref,
            @RequestParam String email) {

        BookingResponseDTO response = bookingService.getBookingStatus(ref, email);
        return ResponseEntity.ok(ApiResponse.success("Booking found", response));
    }

    /**
     * POST /api/bookings/{ref}/initiate-payment
     * Initiate a mock/sandbox payment for an existing booking.
     * Returns a payment reference for the client to use.
     */
    @PostMapping("/{ref}/initiate-payment")
    public ResponseEntity<ApiResponse<PaymentResult>> initiatePayment(
            @PathVariable String ref) {

        PaymentResult result = bookingService.initiatePayment(ref);
        return ResponseEntity.ok(ApiResponse.success(
                "Payment initiated [" + result.getMode() + "]", result));
    }

    /**
     * POST /api/bookings/{ref}/confirm-payment
     * Backend verifies the payment signature before marking booking as PAID.
     * Frontend success screen alone must never trigger this directly without signature.
     *
     * Body: { "paymentReference": "MOCK-SSE-2026-0001-ABCD1234", "signature": "mock" }
     */
    @PostMapping("/{ref}/confirm-payment")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> confirmPayment(
            @PathVariable String ref,
            @RequestBody Map<String, String> payload) {

        String paymentReference = payload.get("paymentReference");
        String signature        = payload.get("signature");

        BookingResponseDTO response = bookingService.confirmPayment(ref, paymentReference, signature);
        return ResponseEntity.ok(ApiResponse.success(
                "Payment verified and confirmed. Booking is now CONFIRMED.", response));
    }
}
