package com.sakhievents.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class EventRequestDTO {

    @NotBlank(message = "Event name is required")
    @Size(min = 3, max = 200, message = "Event name must be between 3 and 200 characters")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(min = 10, message = "Description must be at least 10 characters")
    private String description;

    @NotNull(message = "Event start date is required")
    private LocalDate eventDate;

    // Optional – for multi-day events; must be on or after eventDate
    private LocalDate endDate;

    @NotBlank(message = "Venue is required")
    @Size(max = 300, message = "Venue name must not exceed 300 characters")
    private String venue;

    @Size(max = 500, message = "Venue address must not exceed 500 characters")
    private String venueAddress;

    /**
     * Allowed values: UPCOMING, ONGOING, PAST
     */
    @NotBlank(message = "Event type is required (UPCOMING, ONGOING, PAST)")
    @Pattern(regexp = "UPCOMING|ONGOING|PAST", message = "Event type must be one of: UPCOMING, ONGOING, PAST")
    private String eventType;

    /**
     * Allowed values: OPEN, CLOSED, COMING_SOON, NOT_REQUIRED
     */
    @NotBlank(message = "Registration status is required (OPEN, CLOSED, COMING_SOON, NOT_REQUIRED)")
    @Pattern(regexp = "OPEN|CLOSED|COMING_SOON|NOT_REQUIRED", message = "Registration status must be one of: OPEN, CLOSED, COMING_SOON, NOT_REQUIRED")
    private String registrationStatus;

    // Optional fields
    private String imageUrl;
    private String bannerUrl;

    @Min(value = 1, message = "Maximum capacity must be at least 1")
    @Max(value = 100000, message = "Maximum capacity must not exceed 100,000")
    private Integer maxCapacity;

    @Min(value = 0, message = "Registered count cannot be negative")
    private Integer registeredCount;

    private List<String> highlights;
    private List<String> tags;

    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    @Size(max = 200, message = "Organizer name must not exceed 200 characters")
    private String organizer;

    @Email(message = "Contact email must be a valid email address")
    private String contactEmail;

    @Pattern(regexp = "^(\\+91[\\-\\s]?)?[6-9]\\d{4}[\\-\\s]?\\d{5}$|^(\\+91|0)?[6-9]\\d{9}$|^$", message = "Contact phone must be a valid 10-digit mobile number")
    private String contactPhone;

    private Boolean isFeatured;
}
