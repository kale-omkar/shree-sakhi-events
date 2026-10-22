package com.sakhievents.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegistrationRequestDTO {

    @NotNull(message = "Event ID is required")
    private Long eventId;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-\\s()]{10,15}$", message = "Enter a valid 10-digit phone number")
    private String phone;

    private String city;

    private String organization;

    @Min(value = 1, message = "Number of attendees must be at least 1")
    @Max(value = 10, message = "Maximum 10 attendees per registration")
    private Integer numberOfAttendees = 1;

    @Size(max = 500, message = "Remarks cannot exceed 500 characters")
    private String remarks;
}
