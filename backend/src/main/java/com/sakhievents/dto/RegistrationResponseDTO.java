package com.sakhievents.dto;

import com.sakhievents.model.Registration;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RegistrationResponseDTO {
    private Long id;
    private Long eventId;
    private String eventName;
    private String fullName;
    private String email;
    private String phone;
    private String city;
    private String organization;
    private Integer numberOfAttendees;
    private String status;
    private String confirmationCode;
    private String remarks;
    private LocalDateTime registeredAt;

    public static RegistrationResponseDTO fromEntity(Registration reg) {
        RegistrationResponseDTO dto = new RegistrationResponseDTO();
        dto.setId(reg.getId());
        dto.setEventId(reg.getEvent().getId());
        dto.setEventName(reg.getEvent().getName());
        dto.setFullName(reg.getFullName());
        dto.setEmail(reg.getEmail());
        dto.setPhone(reg.getPhone());
        dto.setCity(reg.getCity());
        dto.setOrganization(reg.getOrganization());
        dto.setNumberOfAttendees(reg.getNumberOfAttendees());
        dto.setStatus(reg.getStatus().name());
        dto.setConfirmationCode(reg.getConfirmationCode());
        dto.setRemarks(reg.getRemarks());
        dto.setRegisteredAt(reg.getRegisteredAt());
        return dto;
    }
}
