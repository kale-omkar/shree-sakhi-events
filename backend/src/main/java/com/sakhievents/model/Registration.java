package com.sakhievents.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Event ID is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @NotBlank(message = "Full name is required")
    @Column(nullable = false)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    @Column(nullable = false)
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-\\s()]{10,15}$", message = "Enter a valid 10-digit phone number")
    @Column(nullable = false)
    private String phone;

    private String city;

    private String organization; // company or institution (optional)

    private Integer numberOfAttendees; // for group registrations

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus status; // PENDING, CONFIRMED, CANCELLED

    private String remarks; // any special notes from registrant

    @Column(unique = true)
    private String confirmationCode; // e.g. SSE-2024-001

    @Column(updatable = false)
    private LocalDateTime registeredAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        registeredAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = RegistrationStatus.CONFIRMED;
        if (numberOfAttendees == null) numberOfAttendees = 1;
        // Generate confirmation code
        confirmationCode = "SSE-" + System.currentTimeMillis();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum RegistrationStatus {
        PENDING, CONFIRMED, CANCELLED
    }
}
