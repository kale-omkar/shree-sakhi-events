package com.sakhievents.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "enquiries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Full name is required")
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "company_name", length = 100)
    private String companyName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    @Column(name = "email", nullable = false)
    private String email;

    @NotBlank(message = "Phone number is required")
    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @NotBlank(message = "Enquiry type is required")
    @Column(name = "enquiry_type", nullable = false, length = 100)
    private String enquiryType;

    @NotBlank(message = "Message is required")
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
