package com.sakhievents.controller;

import com.sakhievents.dto.ApiResponse;
import com.sakhievents.dto.EventResponseDTO;
import com.sakhievents.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    // GET /api/events - Get all events
    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponseDTO>>> getAllEvents() {
        List<EventResponseDTO> events = eventService.getAllEvents();
        return ResponseEntity.ok(ApiResponse.success("Events fetched successfully", events));
    }

    // GET /api/events/{id} - Get event by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponseDTO>> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(event -> ResponseEntity.ok(ApiResponse.success("Event found", event)))
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/events/upcoming - Get all upcoming events
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<EventResponseDTO>>> getUpcomingEvents() {
        List<EventResponseDTO> events = eventService.getUpcomingEvents();
        return ResponseEntity.ok(ApiResponse.success("Upcoming events fetched", events));
    }

    // GET /api/events/past - Get all past events
    @GetMapping("/past")
    public ResponseEntity<ApiResponse<List<EventResponseDTO>>> getPastEvents() {
        List<EventResponseDTO> events = eventService.getPastEvents();
        return ResponseEntity.ok(ApiResponse.success("Past events fetched", events));
    }

    // GET /api/events/featured - Get featured events
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<EventResponseDTO>>> getFeaturedEvents() {
        List<EventResponseDTO> events = eventService.getFeaturedEvents();
        return ResponseEntity.ok(ApiResponse.success("Featured events fetched", events));
    }

    // GET /api/events/search?keyword=xyz - Search events
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EventResponseDTO>>> searchEvents(@RequestParam String keyword) {
        List<EventResponseDTO> events = eventService.searchEvents(keyword);
        return ResponseEntity.ok(ApiResponse.success("Search results", events));
    }
}
