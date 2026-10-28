package com.sakhievents.controller;

import com.sakhievents.dto.ApiResponse;
import com.sakhievents.dto.EventRequestDTO;
import com.sakhievents.dto.EventResponseDTO;
import com.sakhievents.exception.UnauthorizedException;
import com.sakhievents.service.AdminEventService;
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
@RequestMapping("/api/admin/events")
@CrossOrigin(
    origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class AdminEventController {

    private final AdminEventService adminEventService;
    private final String adminApiKey;

    public AdminEventController(AdminEventService adminEventService) {
        this(adminEventService, System.getProperty("admin.api.key", ""));
    }

    @Autowired
    public AdminEventController(
            AdminEventService adminEventService,
            @Value("${admin.api.key:}") String adminApiKey) {
        this.adminEventService = adminEventService;
        this.adminApiKey = adminApiKey;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponseDTO>>> getAllEvents(
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey) {

        validateAdminKey(adminKey);
        List<EventResponseDTO> events = adminEventService.getAllEvents();
        return ResponseEntity.ok(ApiResponse.success("All events fetched successfully", events));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponseDTO>> getEventById(
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey,
            @PathVariable Long id) {

        validateAdminKey(adminKey);
        EventResponseDTO event = adminEventService.getEventById(id);
        return ResponseEntity.ok(ApiResponse.success("Event fetched successfully", event));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EventResponseDTO>> createEvent(
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey,
            @Valid @RequestBody EventRequestDTO dto) {

        validateAdminKey(adminKey);
        EventResponseDTO created = adminEventService.createEvent(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Event created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponseDTO>> updateEvent(
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey,
            @PathVariable Long id,
            @Valid @RequestBody EventRequestDTO dto) {

        validateAdminKey(adminKey);
        EventResponseDTO updated = adminEventService.updateEvent(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Event updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey,
            @PathVariable Long id) {

        validateAdminKey(adminKey);
        adminEventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success("Event deleted successfully", null));
    }

    @RequestMapping(value = "/{id}/toggle-featured", method = {RequestMethod.PATCH, RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<ApiResponse<EventResponseDTO>> toggleFeatured(
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey,
            @PathVariable Long id) {

        validateAdminKey(adminKey);
        EventResponseDTO updated = adminEventService.toggleFeatured(id);
        String msg = Boolean.TRUE.equals(updated.getIsFeatured())
                ? "Event marked as featured"
                : "Event removed from featured";
        return ResponseEntity.ok(ApiResponse.success(msg, updated));
    }

    // ─── Secure Admin Key Validation ──────────────────────────────────────────

    private boolean isValidAdminKey(String key) {
        String configuredKey = (adminApiKey != null && !adminApiKey.isBlank())
                ? adminApiKey
                : System.getProperty("admin.api.key");

        // Fail-safe: if admin API key is unconfigured or blank, deny all access
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

    private void validateAdminKey(String key) {
        if (!isValidAdminKey(key)) {
            throw new UnauthorizedException("Unauthorised: invalid or missing admin API key");
        }
    }
}
