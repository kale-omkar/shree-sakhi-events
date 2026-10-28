package com.sakhievents.service;

import com.sakhievents.dto.EnquiryRequestDTO;
import com.sakhievents.dto.EnquiryResponseDTO;
import com.sakhievents.model.Enquiry;
import com.sakhievents.repository.EnquiryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EnquiryServiceTest {

    @Mock
    private EnquiryRepository enquiryRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private EnquiryService enquiryService;

    private EnquiryRequestDTO requestDTO;
    private Enquiry savedEnquiry;

    @BeforeEach
    void setUp() {
        requestDTO = EnquiryRequestDTO.builder()
                .fullName("  Sneha Patil  ")
                .companyName("  Patil Enterprises  ")
                .email("  Sneha.Patil@Example.com  ")
                .phone("  9822334455  ")
                .enquiryType("Sponsorship & Partnerships")
                .message("We would like to co-sponsor the upcoming cultural event.")
                .build();

        savedEnquiry = Enquiry.builder()
                .id(1L)
                .fullName("Sneha Patil")
                .companyName("Patil Enterprises")
                .email("sneha.patil@example.com")
                .phone("9822334455")
                .enquiryType("Sponsorship & Partnerships")
                .message("We would like to co-sponsor the upcoming cultural event.")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("createEnquiry: Successfully saves enquiry and invokes email notification")
    void testCreateEnquiry_Success() {
        when(enquiryRepository.save(any(Enquiry.class))).thenReturn(savedEnquiry);
        when(emailService.sendEnquiryNotification(any(Enquiry.class))).thenReturn(true);

        EnquiryResponseDTO response = enquiryService.createEnquiry(requestDTO);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Sneha Patil", response.getFullName());
        assertEquals("sneha.patil@example.com", response.getEmail());
        assertEquals("Sponsorship & Partnerships", response.getEnquiryType());

        // Verify entity fields were trimmed before save
        ArgumentCaptor<Enquiry> captor = ArgumentCaptor.forClass(Enquiry.class);
        verify(enquiryRepository, times(1)).save(captor.capture());
        Enquiry captured = captor.getValue();
        assertEquals("Sneha Patil", captured.getFullName());
        assertEquals("Patil Enterprises", captured.getCompanyName());
        assertEquals("sneha.patil@example.com", captured.getEmail());
        assertEquals("9822334455", captured.getPhone());

        // Verify emailService was invoked AFTER save
        verify(emailService, times(1)).sendEnquiryNotification(savedEnquiry);
    }

    @Test
    @DisplayName("createEnquiry: When emailService throws unexpected error, enquiry persistence is preserved")
    void testCreateEnquiry_WhenEmailFails_EnquiryPersistedSafely() {
        when(enquiryRepository.save(any(Enquiry.class))).thenReturn(savedEnquiry);
        doThrow(new RuntimeException("SMTP transport unavailable")).when(emailService).sendEnquiryNotification(any(Enquiry.class));

        EnquiryResponseDTO response = assertDoesNotThrow(() -> enquiryService.createEnquiry(requestDTO));

        assertNotNull(response);
        assertEquals(1L, response.getId());
        verify(enquiryRepository, times(1)).save(any(Enquiry.class));
    }

    @Test
    @DisplayName("getEnquiryById: Returns DTO when enquiry exists")
    void testGetEnquiryById_Found() {
        when(enquiryRepository.findById(1L)).thenReturn(Optional.of(savedEnquiry));

        Optional<EnquiryResponseDTO> result = enquiryService.getEnquiryById(1L);

        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getId());
        assertEquals("Sneha Patil", result.get().getFullName());
    }

    @Test
    @DisplayName("getEnquiryById: Returns empty Optional when not found")
    void testGetEnquiryById_NotFound() {
        when(enquiryRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<EnquiryResponseDTO> result = enquiryService.getEnquiryById(999L);

        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("getAllEnquiries: Returns ordered list of enquiry DTOs")
    void testGetAllEnquiries() {
        when(enquiryRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(savedEnquiry));

        List<EnquiryResponseDTO> results = enquiryService.getAllEnquiries();

        assertEquals(1, results.size());
        assertEquals("Sneha Patil", results.get(0).getFullName());
    }
}
