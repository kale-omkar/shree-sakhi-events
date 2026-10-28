package com.sakhievents.service;

import com.sakhievents.dto.EnquiryRequestDTO;
import com.sakhievents.dto.EnquiryResponseDTO;
import com.sakhievents.model.Enquiry;
import com.sakhievents.repository.EnquiryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EnquiryService {

    private static final Logger log = LoggerFactory.getLogger(EnquiryService.class);

    private final EnquiryRepository enquiryRepository;
    private final EmailService emailService;

    @Autowired
    public EnquiryService(EnquiryRepository enquiryRepository, EmailService emailService) {
        this.enquiryRepository = enquiryRepository;
        this.emailService = emailService;
    }

    /**
     * Persists an enquiry to the database first, and then triggers a safe
     * email notification to the official recipient if enabled.
     *
     * @param dto the validated enquiry request
     * @return EnquiryResponseDTO representing the saved enquiry
     */
    @Transactional
    public EnquiryResponseDTO createEnquiry(EnquiryRequestDTO dto) {
        // Map DTO to entity with whitespace sanitation
        Enquiry enquiry = Enquiry.builder()
                .fullName(dto.getFullName().trim())
                .companyName(dto.getCompanyName() != null && !dto.getCompanyName().isBlank()
                        ? dto.getCompanyName().trim()
                        : null)
                .email(dto.getEmail().trim().toLowerCase())
                .phone(dto.getPhone().trim())
                .enquiryType(dto.getEnquiryType().trim())
                .message(dto.getMessage().trim())
                .build();

        // 1. Save enquiry in database
        Enquiry savedEnquiry = enquiryRepository.save(enquiry);
        log.info("Enquiry #{} persisted successfully in database for {}", savedEnquiry.getId(), savedEnquiry.getEmail());

        // 2. Trigger email notification (failures are caught so DB save is not rolled back)
        try {
            emailService.sendEnquiryNotification(savedEnquiry);
        } catch (Exception e) {
            log.error("Unexpected error in email dispatch for enquiry #{}: {}", savedEnquiry.getId(), e.getMessage());
        }

        return EnquiryResponseDTO.fromEntity(savedEnquiry);
    }

    @Transactional(readOnly = true)
    public Optional<EnquiryResponseDTO> getEnquiryById(Long id) {
        return enquiryRepository.findById(id).map(EnquiryResponseDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<EnquiryResponseDTO> getAllEnquiries() {
        return enquiryRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(EnquiryResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
