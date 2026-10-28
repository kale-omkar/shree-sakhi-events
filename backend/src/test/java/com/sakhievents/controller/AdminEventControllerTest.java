package com.sakhievents.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sakhievents.dto.EventRequestDTO;
import com.sakhievents.dto.EventResponseDTO;
import com.sakhievents.exception.GlobalExceptionHandler;
import com.sakhievents.exception.UnauthorizedException;
import com.sakhievents.service.AdminEventService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AdminEventController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@TestPropertySource(properties = "admin.api.key=" + AdminEventControllerTest.TEST_ADMIN_KEY)
class AdminEventControllerTest {

    public static final String TEST_ADMIN_KEY = "test-dummy-event-admin-key";
    public static final String INVALID_ADMIN_KEY = "invalid-event-key-xyz";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AdminEventService adminEventService;

    @Test
    @DisplayName("GET /api/admin/events - returns 401 when X-Admin-Key is missing")
    void testGetAllEvents_MissingKey_Returns401() throws Exception {
        mockMvc.perform(get("/api/admin/events"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Unauthorised: invalid or missing admin API key"));

        verifyNoInteractions(adminEventService);
    }

    @Test
    @DisplayName("GET /api/admin/events - returns 401 when X-Admin-Key is invalid")
    void testGetAllEvents_InvalidKey_Returns401() throws Exception {
        mockMvc.perform(get("/api/admin/events")
                        .header("X-Admin-Key", INVALID_ADMIN_KEY))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Unauthorised: invalid or missing admin API key"));

        verifyNoInteractions(adminEventService);
    }

    @Test
    @DisplayName("GET /api/admin/events - returns 401 when X-Admin-Key is blank")
    void testGetAllEvents_BlankKey_Returns401() throws Exception {
        mockMvc.perform(get("/api/admin/events")
                        .header("X-Admin-Key", "   "))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Unauthorised: invalid or missing admin API key"));

        verifyNoInteractions(adminEventService);
    }

    @Test
    @DisplayName("GET /api/admin/events - returns 200 when X-Admin-Key is valid")
    void testGetAllEvents_ValidKey_Returns200() throws Exception {
        when(adminEventService.getAllEvents()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/admin/events")
                        .header("X-Admin-Key", TEST_ADMIN_KEY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(adminEventService, times(1)).getAllEvents();
    }

    @Test
    @DisplayName("GET /api/admin/events/{id} - returns 401 when X-Admin-Key is missing")
    void testGetEventById_MissingKey_Returns401() throws Exception {
        mockMvc.perform(get("/api/admin/events/1"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));

        verifyNoInteractions(adminEventService);
    }

    @Test
    @DisplayName("POST /api/admin/events - returns 401 when X-Admin-Key is missing")
    void testCreateEvent_MissingKey_Returns401() throws Exception {
        EventRequestDTO dto = new EventRequestDTO();
        dto.setName("Sample Event");
        dto.setDescription("Sample Description of appropriate length");
        dto.setEventDate(LocalDate.now().plusDays(10));
        dto.setVenue("Sample Venue");
        dto.setEventType("UPCOMING");
        dto.setRegistrationStatus("OPEN");

        mockMvc.perform(post("/api/admin/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));

        verifyNoInteractions(adminEventService);
    }

    @Test
    @DisplayName("DELETE /api/admin/events/{id} - returns 401 when X-Admin-Key is missing")
    void testDeleteEvent_MissingKey_Returns401() throws Exception {
        mockMvc.perform(delete("/api/admin/events/1"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));

        verifyNoInteractions(adminEventService);
    }

    @Test
    @DisplayName("Fail-safe: AdminEventController fails closed when admin key is unconfigured or blank")
    void testAdminEventControllerFailSafe() {
        AdminEventController unconfigured = new AdminEventController(adminEventService, "");
        assertThrows(UnauthorizedException.class, () -> unconfigured.getAllEvents("any-key"));

        AdminEventController nullKey = new AdminEventController(adminEventService, null);
        assertThrows(UnauthorizedException.class, () -> nullKey.getAllEvents("any-key"));

        AdminEventController blankKey = new AdminEventController(adminEventService, "   ");
        assertThrows(UnauthorizedException.class, () -> blankKey.getAllEvents("any-key"));
    }
}
