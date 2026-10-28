package com.sakhievents.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Booking entity — Jatin Patil's module.
 * Represents a stall / attendance / sponsorship booking for an event.
 * Table: bookings (separate from registrations table — different use-case and fields).
 */
@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique booking reference e.g. SSE-2026-0001 */
    @Column(unique = true, nullable = false, length = 20)
    private String bookingRef;

    /** FK to existing events table — reuse, do not duplicate */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookerType bookerType;

    @Column(nullable = false)
    private String fullName;

    /** Optional for visitors, recommended for exhibitors/sponsors */
    private String company;

    @Column(nullable = false, length = 15)
    private String phone;

    @Column(nullable = false)
    private String email;

    /** Attendees (visitor) | Stalls (exhibitor) | Slots (sponsor) */
    @Column(nullable = false)
    private Integer quantity;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus bookingStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus;

    /** Gateway reference / order ID from Razorpay or mock token */
    private String paymentReference;

    /** Amount in INR — pending client confirmation on fee structure */
    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (bookingStatus == null)  bookingStatus  = BookingStatus.PENDING;
        if (paymentStatus == null)  paymentStatus  = PaymentStatus.NOT_REQUIRED;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ─── Enums ────────────────────────────────────────────────────────────────

    public enum BookerType {
        VISITOR,    // general attendee
        EXHIBITOR,  // books stalls to showcase products
        SPONSOR     // corporate sponsor
    }

    public enum BookingStatus {
        PENDING,    // just created, awaiting confirmation
        CONFIRMED,  // admin confirmed / payment received
        CANCELLED   // cancelled by user or admin
    }

    public enum PaymentStatus {
        NOT_REQUIRED, // free event or no payment configured
        PENDING,      // payment initiated but not yet completed
        PAID,         // payment verified on backend
        FAILED        // payment verification failed
    }
}
