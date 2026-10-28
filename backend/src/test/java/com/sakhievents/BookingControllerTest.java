package com.sakhievents;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sakhievents.controller.AdminBookingController;
import com.sakhievents.controller.BookingController;
import com.sakhievents.dto.BookingRequestDTO;
import com.sakhievents.dto.BookingResponseDTO;
import com.sakhievents.dto.BookingStatusUpdateDTO;
import com.sakhievents.model.Booking;
import com.sakhievents.service.BookingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {BookingController.class, AdminBookingController.class})
@AutoConfigureMockMvc(addFilters = false)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BookingService bookingService;

    @MockBean
    private com.sakhievents.service.EventService eventService;

    @Test
    @DisplayName("POST /api/bookings - should return 201 when payload is valid")
    void testCreateBookingValidPayload() throws Exception {
        BookingRequestDTO request = new BookingRequestDTO();
        request.setEventId(1L);
        request.setBookerType(Booking.BookerType.VISITOR);
        request.setFullName("Aarav Mehta");
        request.setPhone("9876543210");
        request.setEmail("aarav@example.com");
        request.setQuantity(2);
        request.setConsent(true);

        BookingResponseDTO response = new BookingResponseDTO();
        response.setId(10L);
        response.setBookingRef("SSE-2026-0005");
        response.setFullName("Aarav Mehta");
        response.setBookingStatus("PENDING");

        when(bookingService.createBooking(any(BookingRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.bookingRef").value("SSE-2026-0005"));
    }

    @Test
    @DisplayName("POST /api/bookings - should return 400 when required fields are missing")
    void testCreateBookingInvalidPayload() throws Exception {
        BookingRequestDTO request = new BookingRequestDTO();
        // Missing eventId, fullName, phone, email

        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GET /api/bookings/status - should return 200 with booking details")
    void testGetBookingStatus() throws Exception {
        BookingResponseDTO response = new BookingResponseDTO();
        response.setBookingRef("SSE-2026-0001");
        response.setEmail("priya@example.com");
        response.setBookingStatus("CONFIRMED");

        when(bookingService.getBookingStatus("SSE-2026-0001", "priya@example.com")).thenReturn(response);

        mockMvc.perform(get("/api/bookings/status")
                .param("ref", "SSE-2026-0001")
                .param("email", "priya@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.bookingStatus").value("CONFIRMED"));
    }

    @Test
    @DisplayName("GET /api/admin/bookings - should reject request without X-Admin-Key")
    void testAdminGetBookingsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/admin/bookings"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Unauthorised: invalid or missing admin API key"));
    }

    @Test
    @DisplayName("GET /api/admin/bookings - should succeed with valid X-Admin-Key")
    void testAdminGetBookingsAuthorized() throws Exception {
        when(bookingService.getAllBookings(null, null)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/admin/bookings")
                .header("X-Admin-Key", "sakhi-admin-2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("PATCH /api/admin/bookings/{id} - should update status when authorized")
    void testAdminUpdateBookingStatus() throws Exception {
        BookingStatusUpdateDTO updateDTO = new BookingStatusUpdateDTO();
        updateDTO.setBookingStatus(Booking.BookingStatus.CONFIRMED);

        BookingResponseDTO response = new BookingResponseDTO();
        response.setId(1L);
        response.setBookingStatus("CONFIRMED");

        when(bookingService.updateBookingStatus(eq(1L), any(BookingStatusUpdateDTO.class))).thenReturn(response);

        mockMvc.perform(patch("/api/admin/bookings/1")
                .header("X-Admin-Key", "sakhi-admin-2026")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.bookingStatus").value("CONFIRMED"));
    }
}
