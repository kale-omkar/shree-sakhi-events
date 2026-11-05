package com.sakhievents.model.booking;

import com.sakhievents.model.Booking;
import com.sakhievents.model.stall.Stall;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * BookingStall junction entity — stalls booked within a single booking.
 * Captures the price snapshot at booking time.
 * Table: booking_stalls
 */
@Entity
@Table(
    name = "booking_stalls",
    uniqueConstraints = @UniqueConstraint(columnNames = {"booking_id", "stall_id"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingStall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stall_id", nullable = false)
    private Stall stall;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAtBooking;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
