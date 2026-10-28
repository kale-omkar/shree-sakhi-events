package com.sakhievents.controller;

import com.sakhievents.dto.ApiResponse;
import com.sakhievents.dto.EnquiryRequestDTO;
import com.sakhievents.dto.EnquiryResponseDTO;
import com.sakhievents.service.EnquiryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

@RestController
@RequestMapping("/api/enquiries")
public class EnquiryController {

    private final EnquiryService enquiryService;
    private final String adminApiKey;

    public EnquiryController(EnquiryService enquiryService) {
        this(enquiryService, System.getProperty("admin.api.key", ""));
    }

    @Autowired
    public EnquiryController(
            EnquiryService enquiryService,
            @Value("${admin.api.key:}") String adminApiKey) {
        this.enquiryService = enquiryService;
        this.adminApiKey = adminApiKey;
    }

    private boolean isValidAdminKey(String key) {
        String configuredKey = (adminApiKey != null && !adminApiKey.isBlank())
                ? adminApiKey
                : System.getProperty("admin.api.key");

        // Fail safely if admin API key is missing or blank
        if (configuredKey == null || configuredKey.isBlank()) {
            return false;
        }

        if (key == null || key.isBlank()) {
            return false;
        }

        // Constant-time comparison to mitigate timing attacks
        return MessageDigest.isEqual(
                configuredKey.getBytes(StandardCharsets.UTF_8),
                key.getBytes(StandardCharsets.UTF_8)
        );
    }

    /**
     * POST /api/enquiries - Submit a new enquiry (Publicly accessible)
     * Validates input fields, persists to the database, triggers email notification,
     * and returns the saved enquiry with HTTP 201 Created.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<EnquiryResponseDTO>> submitEnquiry(
            @Valid @RequestBody EnquiryRequestDTO dto) {
        EnquiryResponseDTO response = enquiryService.createEnquiry(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Enquiry submitted successfully", response));
    }

    /**
     * GET /api/enquiries/{id} - Retrieve enquiry by ID (Admin protected)
     * Requires valid X-Admin-Key header. Returns 401 Unauthorized if missing or invalid.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EnquiryResponseDTO>> getById(
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey,
            @PathVariable Long id) {
        if (!isValidAdminKey(adminKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorised: invalid or missing admin API key"));
        }
        return enquiryService.getEnquiryById(id)
                .map(enquiry -> ResponseEntity.ok(ApiResponse.success("Enquiry found", enquiry)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("No enquiry found with ID: " + id)));
    }

    /**
     * GET /api/enquiries - Retrieve all enquiries (ordered newest first) (Admin protected)
     * Requires valid X-Admin-Key header. Returns 401 Unauthorized if missing or invalid.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<EnquiryResponseDTO>>> getAll(
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey) {
        if (!isValidAdminKey(adminKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorised: invalid or missing admin API key"));
        }
        List<EnquiryResponseDTO> enquiries = enquiryService.getAllEnquiries();
        return ResponseEntity.ok(ApiResponse.success("Enquiries fetched successfully", enquiries));
    }
}
