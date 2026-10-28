package com.sakhievents.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sakhievents.dto.EnquiryRequestDTO;
import com.sakhievents.dto.EnquiryResponseDTO;
import com.sakhievents.exception.GlobalExceptionHandler;
import com.sakhievents.service.EnquiryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EnquiryController.class)
@Import(GlobalExceptionHandler.class)
class EnquiryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EnquiryService enquiryService;

    @Test
    @DisplayName("POST /api/enquiries: Returns 201 Created on valid input")
    void testSubmitEnquiry_ValidRequest_Returns201Created() throws Exception {
        EnquiryRequestDTO request = EnquiryRequestDTO.builder()
                .fullName("Pooja Deshmukh")
                .companyName("Deshmukh Organic Farms")
                .email("pooja@example.com")
                .phone("9876543210")
                .enquiryType("Stall Booking / Exhibition Space")
                .message("We would like to book a stall for selling organic handmade pickles and snacks.")
                .build();

        EnquiryResponseDTO responseDTO = EnquiryResponseDTO.builder()
                .id(1L)
                .fullName("Pooja Deshmukh")
                .companyName("Deshmukh Organic Farms")
                .email("pooja@example.com")
                .phone("9876543210")
                .enquiryType("Stall Booking / Exhibition Space")
                .message("We would like to book a stall for selling organic handmade pickles and snacks.")
                .createdAt(LocalDateTime.now())
                .build();

        when(enquiryService.createEnquiry(any(EnquiryRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/api/enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Enquiry submitted successfully"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.fullName").value("Pooja Deshmukh"))
                .andExpect(jsonPath("$.data.email").value("pooja@example.com"))
                .andExpect(jsonPath("$.data.enquiryType").value("Stall Booking / Exhibition Space"));

        verify(enquiryService, times(1)).createEnquiry(any(EnquiryRequestDTO.class));
    }

    @Test
    @DisplayName("POST /api/enquiries: Returns 400 Bad Request with field validation errors for invalid input")
    void testSubmitEnquiry_InvalidFields_Returns400BadRequest() throws Exception {
        EnquiryRequestDTO invalidRequest = EnquiryRequestDTO.builder()
                .fullName(" ")                         // Blank: fails @NotBlank
                .companyName("Valid Company")
                .email("invalid-email-address")         // Fails @Email
                .phone("123")                          // Fails 10-15 digits @Pattern
                .enquiryType(" ")                      // Blank: fails @NotBlank
                .message("Too short")                  // Fails @Size(min = 10)
                .build();

        mockMvc.perform(post("/api/enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.data.fullName").exists())
                .andExpect(jsonPath("$.data.email").exists())
                .andExpect(jsonPath("$.data.phone").exists())
                .andExpect(jsonPath("$.data.enquiryType").exists())
                .andExpect(jsonPath("$.data.message").exists());

        verifyNoInteractions(enquiryService);
    }

    @Test
    @DisplayName("GET /api/enquiries/{id}: Returns 200 OK when enquiry exists")
    void testGetById_Found() throws Exception {
        EnquiryResponseDTO responseDTO = EnquiryResponseDTO.builder()
                .id(5L)
                .fullName("Anita Roy")
                .email("anita@example.com")
                .phone("9811223344")
                .enquiryType("General Inquiry & Support")
                .message("Can you share visitor timing details?")
                .createdAt(LocalDateTime.now())
                .build();

        when(enquiryService.getEnquiryById(5L)).thenReturn(Optional.of(responseDTO));

        mockMvc.perform(get("/api/enquiries/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(5))
                .andExpect(jsonPath("$.data.fullName").value("Anita Roy"));
    }

    @Test
    @DisplayName("GET /api/enquiries/{id}: Returns 404 Not Found when enquiry does not exist")
    void testGetById_NotFound() throws Exception {
        when(enquiryService.getEnquiryById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/enquiries/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("No enquiry found with ID: 999"));
    }

    @Test
    @DisplayName("GET /api/enquiries: Returns 200 OK with list of all enquiries")
    void testGetAll_ReturnsList() throws Exception {
        EnquiryResponseDTO responseDTO = EnquiryResponseDTO.builder()
                .id(1L)
                .fullName("Anita Roy")
                .email("anita@example.com")
                .phone("9811223344")
                .enquiryType("General Inquiry & Support")
                .message("Can you share visitor timing details?")
                .createdAt(LocalDateTime.now())
                .build();

        when(enquiryService.getAllEnquiries()).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/enquiries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].fullName").value("Anita Roy"));
    }
}
