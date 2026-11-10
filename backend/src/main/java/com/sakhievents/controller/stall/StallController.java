package com.sakhievents.controller.stall;

import com.sakhievents.dto.ApiResponse;
import com.sakhievents.dto.stall.StallConfiguration;
import com.sakhievents.dto.stall.StallDTO;
import com.sakhievents.dto.stall.StallHoldRequest;
import com.sakhievents.dto.stall.StallHoldResponse;
import com.sakhievents.dto.stall.StallReleaseRequest;
import com.sakhievents.exception.StallConflictException;
import com.sakhievents.service.stall.StallLayoutParserService;
import com.sakhievents.service.stall.StallService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

/**
 * Stall endpoints for the Stall Selection step and layout processing.
 * Public endpoints — no admin key required.
 */
@RestController
@RequestMapping("/api")
public class StallController {

    @Autowired
    private StallService stallService;

    @Autowired
    private StallLayoutParserService layoutParserService;

    /**
     * GET /api/events/{eventId}/stalls
     * All stalls for an event with live status (AVAILABLE / HELD / BOOKED).
     */
    @GetMapping("/events/{eventId}/stalls")
    public ResponseEntity<ApiResponse<List<StallDTO>>> getStalls(
            @PathVariable Long eventId,
            @RequestParam(required = false) String sessionId) {

        List<StallDTO> stalls = stallService.getStalls(eventId, sessionId);
        return ResponseEntity.ok(ApiResponse.success("Stalls fetched", stalls));
    }

    /**
     * POST /api/stalls/hold
     * Atomically holds the requested stalls for the session (default 10 min TTL).
     * Returns 409 if any stall is already held by another session or booked.
     */
    @PostMapping("/stalls/hold")
    public ResponseEntity<ApiResponse<StallHoldResponse>> holdStalls(
            @Valid @RequestBody StallHoldRequest request) {

        StallHoldResponse response = stallService.holdStalls(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Stalls held successfully", response));
    }

    /**
     * POST /api/stalls/release
     * Release a hold (by token or session id) on deselect / back / expiry.
     */
    @PostMapping("/stalls/release")
    public ResponseEntity<ApiResponse<Void>> releaseHold(@Valid @RequestBody StallReleaseRequest request) {

        stallService.releaseHold(request.getHoldToken(), request.getSessionId());
        return ResponseEntity.ok(ApiResponse.success("Hold released", null));
    }

    /**
     * POST /api/stalls/parse-layout
     * Upload an event stall floor plan image to extract color-coded stall bounding boxes via OpenCV.
     */
    @PostMapping(value = "/stalls/parse-layout", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<StallConfiguration>>> parseLayout(
            @RequestParam("file") MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Please provide a valid layout image file"));
        }

        String originalFilename = file.getOriginalFilename();
        String extension = (originalFilename != null && originalFilename.lastIndexOf('.') > 0)
                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                : ".png";

        File tempFile = File.createTempFile("layout_upload_", extension);
        try {
            file.transferTo(tempFile);
            List<StallConfiguration> configs = layoutParserService.processLayoutImage(tempFile.getAbsolutePath());
            return ResponseEntity.ok(ApiResponse.success("Parsed " + configs.size() + " stall configurations", configs));
        } finally {
            if (tempFile.exists()) {
                tempFile.delete();
            }
        }
    }
}
