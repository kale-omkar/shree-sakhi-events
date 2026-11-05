package com.sakhievents;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sakhievents.controller.stall.StallController;
import com.sakhievents.dto.stall.StallDTO;
import com.sakhievents.dto.stall.StallHoldRequest;
import com.sakhievents.dto.stall.StallHoldResponse;
import com.sakhievents.exception.StallConflictException;
import com.sakhievents.service.stall.StallService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StallController.class)
@Import(com.sakhievents.exception.GlobalExceptionHandler.class)
class StallControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StallService stallService;

    private static final String SESSION = "session-abc-123";

    @Test
    @DisplayName("GET /api/events/{eventId}/stalls - returns stall list with status")
    void testGetStalls() throws Exception {
        StallDTO s = StallDTO.builder()
                .id(1L)
                .stallCode("12")
                .stallType("REGULAR")
                .sizeLabel("9x7")
                .price(new BigDecimal("4000.00"))
                .posX(0).posY(0).width(1).height(1)
                .status("AVAILABLE")
                .isActive(true)
                .build();

        when(stallService.getStalls(eq(1L), eq(SESSION))).thenReturn(List.of(s));

        mockMvc.perform(get("/api/events/1/stalls")
                .param("sessionId", SESSION))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].stallCode").value("12"))
                .andExpect(jsonPath("$.data[0].status").value("AVAILABLE"))
                .andExpect(jsonPath("$.data[0].price").value(4000.00));
    }

    @Test
    @DisplayName("POST /api/stalls/hold - returns 201 with hold token on success")
    void testHoldStallsSuccess() throws Exception {
        StallHoldRequest req = new StallHoldRequest();
        req.setEventId(1L);
        req.setStallCodes(List.of("12", "13"));
        req.setSessionId(SESSION);

        StallHoldResponse resp = StallHoldResponse.builder()
                .holdToken("tok-123")
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .ttlMinutes(10)
                .total(new BigDecimal("8000.00"))
                .heldStalls(List.of())
                .build();

        when(stallService.holdStalls(any(StallHoldRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/stalls/hold")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.holdToken").value("tok-123"))
                .andExpect(jsonPath("$.data.total").value(8000.00));
    }

    @Test
    @DisplayName("POST /api/stalls/hold - returns 409 when stall conflict")
    void testHoldStallsConflict() throws Exception {
        StallHoldRequest req = new StallHoldRequest();
        req.setEventId(1L);
        req.setStallCodes(List.of("12"));
        req.setSessionId(SESSION);

        doThrow(new StallConflictException("Stall '12' is held by another user. Please choose another."))
                .when(stallService).holdStalls(any(StallHoldRequest.class));

        mockMvc.perform(post("/api/stalls/hold")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Stall '12' is held by another user. Please choose another."));
    }

    @Test
    @DisplayName("POST /api/stalls/hold - returns 400 when stallCodes empty")
    void testHoldStallsEmpty() throws Exception {
        StallHoldRequest req = new StallHoldRequest();
        req.setEventId(1L);
        req.setStallCodes(List.of());
        req.setSessionId(SESSION);

        mockMvc.perform(post("/api/stalls/hold")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/stalls/release - returns 200 on release")
    void testReleaseHold() throws Exception {
        com.sakhievents.dto.stall.StallReleaseRequest req =
                new com.sakhievents.dto.stall.StallReleaseRequest();
        req.setHoldToken("tok-123");

        mockMvc.perform(post("/api/stalls/release")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
