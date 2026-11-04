package com.sakhievents.model.stall;

import com.sakhievents.model.Event;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Stall entity — represents a physical bookable stall / unit for an event.
 * Reused by the Stall Selection step of the booking flow.
 * Table: stalls
 */
@Entity
@Table(
    name = "stalls",
    uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "stall_code"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Stall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false, length = 10)
    private String stallCode; // e.g. "12", "A"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StallType stallType; // PREMIUM / REGULAR / CLASSIC / SINGLE_TABLE

    @Column(length = 20)
    private String sizeLabel; // e.g. "9x7"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price; // price in INR

    @Column(nullable = false)
    private Integer posX; // grid X position for floor-plan layout

    @Column(nullable = false)
    private Integer posY; // grid Y position for floor-plan layout

    @Column(nullable = false)
    private Integer width; // grid width in cells

    @Column(nullable = false)
    private Integer height; // grid height in cells

    @Column(nullable = false)
    private Boolean isActive;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) isActive = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /** Stall category — Premium / Regular / Classic / Single Table */
    public enum StallType {
        PREMIUM, REGULAR, CLASSIC, SINGLE_TABLE
    }
}
