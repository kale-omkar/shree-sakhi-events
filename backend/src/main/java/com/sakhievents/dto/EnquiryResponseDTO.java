package com.sakhievents.dto;

import com.sakhievents.model.Enquiry;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnquiryResponseDTO {

    private Long id;
    private String fullName;
    private String companyName;
    private String email;
    private String phone;
    private String enquiryType;
    private String message;
    private LocalDateTime createdAt;

    public static EnquiryResponseDTO fromEntity(Enquiry entity) {
        if (entity == null) {
            return null;
        }
        return EnquiryResponseDTO.builder()
                .id(entity.getId())
                .fullName(entity.getFullName())
                .companyName(entity.getCompanyName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .enquiryType(entity.getEnquiryType())
                .message(entity.getMessage())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
