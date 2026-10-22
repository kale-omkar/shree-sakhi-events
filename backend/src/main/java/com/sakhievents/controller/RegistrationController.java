package com.sakhievents.controller;

import com.sakhievents.dto.ApiResponse;
import com.sakhievents.dto.RegistrationRequestDTO;
import com.sakhievents.dto.RegistrationResponseDTO;
import com.sakhievents.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    // POST /api/registrations - Register for an event
    @PostMapping
    public ResponseEntity<ApiResponse<RegistrationResponseDTO>> register(
            @Valid @RequestBody RegistrationRequestDTO dto) {
        try {
            RegistrationResponseDTO response = registrationService.registerForEvent(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Registration successful! Your confirmation code: " + response.getConfirmationCode(), response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // GET /api/registrations/confirm/{code} - Check registration by confirmation code
    @GetMapping("/confirm/{code}")
    public ResponseEntity<ApiResponse<RegistrationResponseDTO>> getByConfirmationCode(@PathVariable String code) {
        return registrationService.getRegistrationByConfirmationCode(code)
                .map(reg -> ResponseEntity.ok(ApiResponse.success("Registration found", reg)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("No registration found with code: " + code)));
    }

    // GET /api/registrations/event/{eventId} - Get all registrations for an event
    @GetMapping("/event/{eventId}")
    public ResponseEntity<ApiResponse<List<RegistrationResponseDTO>>> getByEventId(@PathVariable Long eventId) {
        List<RegistrationResponseDTO> registrations = registrationService.getRegistrationsByEventId(eventId);
        return ResponseEntity.ok(ApiResponse.success("Registrations fetched", registrations));
    }
}
