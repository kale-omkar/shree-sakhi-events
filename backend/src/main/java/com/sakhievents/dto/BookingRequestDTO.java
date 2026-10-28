package com.sakhievents.dto;

import com.sakhievents.model.Booking;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Request DTO for creating a new booking — Jatin Patil's module.
 * Bean validation annotations match the GlobalExceptionHandler style.
 */
@Data
public class BookingRequestDTO {

    @NotNull(message = "Event ID is required")
    private Long eventId;

    @NotNull(message = "Booker type is required (VISITOR, EXHIBITOR, or SPONSOR)")
    private Booking.BookerType bookerType;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    /** Optional for visitors; expected for exhibitors and sponsors */
    @Size(max = 150, message = "Company name cannot exceed 150 characters")
    private String company;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[6-9][0-9]{9}$",
             message = "Enter a valid 10-digit Indian mobile number starting with 6-9")
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    private String email;

    /** Attendees for visitors, stalls for exhibitors, slots for sponsors */
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Max(value = 50, message = "Maximum quantity is 50")
    private Integer quantity;

    @Size(max = 500, message = "Message cannot exceed 500 characters")
    private String message;

    /** User must explicitly accept terms — validated server-side */
    @AssertTrue(message = "You must accept the terms and conditions to proceed")
    private Boolean consent;
}
