package com.sakhievents.dto;

import com.sakhievents.model.Booking;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for admin PATCH /api/admin/bookings/{id} — Jatin Patil's module.
 */
@Data
public class BookingStatusUpdateDTO {

    @NotNull(message = "Booking status is required")
    private Booking.BookingStatus bookingStatus;

    /** Optional — update payment status alongside booking status */
    private Booking.PaymentStatus paymentStatus;

    /** Optional — record a payment reference from the gateway */
    private String paymentReference;

    /** Optional — internal admin note (not stored; for UI only) */
    private String adminNote;
}
