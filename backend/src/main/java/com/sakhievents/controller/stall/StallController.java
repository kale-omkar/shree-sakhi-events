package com.sakhievents.controller.stall;

import com.sakhievents.dto.ApiResponse;
import com.sakhievents.dto.stall.StallDTO;
import com.sakhievents.dto.stall.StallHoldRequest;
import com.sakhievents.dto.stall.StallHoldResponse;
import com.sakhievents.dto.stall.StallReleaseRequest;
import com.sakhievents.exception.StallConflictException;
import com.sakhievents.service.stall.StallService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Stall endpoints for the Stall Selection step.
 * Public endpoints — no admin key required.
 */
@RestController
@RequestMapping("/api")
public class StallController {

    @Autowired
    private StallService stallService;

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
}
