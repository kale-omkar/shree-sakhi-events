package com.sakhievents.controller;

import com.sakhievents.dto.ApiResponse;
import com.sakhievents.dto.EnquiryRequestDTO;
import com.sakhievents.dto.EnquiryResponseDTO;
import com.sakhievents.service.EnquiryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enquiries")
public class EnquiryController {

    private final EnquiryService enquiryService;

    @Autowired
    public EnquiryController(EnquiryService enquiryService) {
        this.enquiryService = enquiryService;
    }

    /**
     * POST /api/enquiries - Submit a new enquiry
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
     * GET /api/enquiries/{id} - Retrieve enquiry by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EnquiryResponseDTO>> getById(@PathVariable Long id) {
        return enquiryService.getEnquiryById(id)
                .map(enquiry -> ResponseEntity.ok(ApiResponse.success("Enquiry found", enquiry)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("No enquiry found with ID: " + id)));
    }

    /**
     * GET /api/enquiries - Retrieve all enquiries (ordered newest first)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<EnquiryResponseDTO>>> getAll() {
        List<EnquiryResponseDTO> enquiries = enquiryService.getAllEnquiries();
        return ResponseEntity.ok(ApiResponse.success("Enquiries fetched successfully", enquiries));
    }
}
