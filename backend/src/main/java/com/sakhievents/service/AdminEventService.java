package com.sakhievents.service;

import com.sakhievents.dto.EventRequestDTO;
import com.sakhievents.dto.EventResponseDTO;
import com.sakhievents.model.Event;
import com.sakhievents.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.stream.Collectors;

/**
 * Service layer for Admin event management.
 * Handles all CRUD operations with business-rule validation
 * beyond what the DTO annotations cover.
 *
 * Separation rationale: keeps public-read logic in EventService
 * and admin-write logic here, making each easier to test/review.
 */
@Service
public class AdminEventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private com.sakhievents.repository.RegistrationRepository registrationRepository;

    @Autowired
    private CloudinaryAssetService cloudinaryAssetService;

    // ── READ ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<EventResponseDTO> getAllEvents() {
        return eventRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .map(EventResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventResponseDTO getEventById(Long id) {
        Event event = findOrThrow(id);
        return EventResponseDTO.fromEntity(event);
    }

    // ── CREATE ────────────────────────────────────────────────────────────

    /**
     * Maps the validated DTO to an Event entity and saves it.
     * Business rules checked here:
     *  - endDate must be on or after eventDate (if provided)
     *  - registeredCount must not exceed maxCapacity (if both provided)
     */
    @Transactional
    public EventResponseDTO createEvent(EventRequestDTO dto) {
        validateImageUrl(dto);
        validateDates(dto);
        validateCapacity(dto);
        validateStatus(dto);

        Event event = new Event();
        applyDto(dto, event);
        Event saved = eventRepository.save(event);
        return EventResponseDTO.fromEntity(saved);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────

    /**
     * Loads the existing event, applies all changes from the DTO, and saves.
     * Partial update is NOT supported via this endpoint — send full object.
     */
    @Transactional
    public EventResponseDTO updateEvent(Long id, EventRequestDTO dto) {
        validateDates(dto);
        validateCapacity(dto);
        validateStatus(dto);

        Event event = findOrThrow(id);
        applyDto(dto, event);
        Event saved = eventRepository.save(event);
        return EventResponseDTO.fromEntity(saved);
    }

    // ── DELETE ────────────────────────────────────────────────────────────

    @org.springframework.transaction.annotation.Transactional
    public void deleteEvent(Long id) {
        Event event = findOrThrow(id);
        List<String> imageUrls = new ArrayList<>(new LinkedHashSet<>());
        imageUrls.add(event.getImageUrl());
        imageUrls.add(event.getBannerUrl());
        if (event.getImages() != null) {
            imageUrls.addAll(event.getImages());
        }
        cloudinaryAssetService.deleteAssets(imageUrls);
        registrationRepository.deleteByEventId(id);
        eventRepository.delete(event);
    }

    // ── TOGGLE FEATURED ───────────────────────────────────────────────────

    public EventResponseDTO toggleFeatured(Long id) {
        Event event = findOrThrow(id);
        event.setIsFeatured(!Boolean.TRUE.equals(event.getIsFeatured()));
        Event saved = eventRepository.save(event);
        return EventResponseDTO.fromEntity(saved);
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────────

    /** Throws a meaningful exception if the event is not found. */
    private Event findOrThrow(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));
    }

    /**
     * Maps every field from the DTO onto the entity.
     * Used for both create and update to keep code DRY.
     */
    private void applyDto(EventRequestDTO dto, Event event) {
        event.setName(dto.getName().trim());
        event.setDescription(dto.getDescription().trim());
        event.setEventDate(dto.getEventDate());
        event.setEndDate(dto.getEndDate());
        event.setVenue(dto.getVenue().trim());
        event.setVenueAddress(dto.getVenueAddress() != null ? dto.getVenueAddress().trim() : null);
        event.setEventType(Event.EventType.valueOf(dto.getEventType()));
        event.setRegistrationStatus(Event.RegistrationStatus.valueOf(dto.getRegistrationStatus()));
        event.setImageUrl(dto.getImageUrl());
        event.setBannerUrl(dto.getBannerUrl());
        event.setImages(dto.getImages() != null ? dto.getImages() : new java.util.ArrayList<>());
        event.setMaxCapacity(dto.getMaxCapacity());
        event.setRegisteredCount(dto.getRegisteredCount() != null ? dto.getRegisteredCount() : 0);
        event.setHighlights(dto.getHighlights());
        event.setTags(dto.getTags());
        event.setCategory(dto.getCategory());
        event.setOrganizer(dto.getOrganizer());
        event.setContactEmail(dto.getContactEmail());
        event.setContactPhone(dto.getContactPhone());
        event.setIsFeatured(Boolean.TRUE.equals(dto.getIsFeatured()));
    }

    /** Validates that endDate is not before eventDate. */
    private void validateDates(EventRequestDTO dto) {
        if (dto.getEndDate() != null && dto.getEventDate() != null) {
            if (dto.getEndDate().isBefore(dto.getEventDate())) {
                throw new RuntimeException(
                    "End date (" + dto.getEndDate() + ") cannot be before the event start date (" + dto.getEventDate() + ")");
            }
        }
    }

    /** Validates that a PAST event cannot have OPEN registration status. */
    private void validateStatus(EventRequestDTO dto) {
        if ("PAST".equalsIgnoreCase(dto.getEventType()) && "OPEN".equalsIgnoreCase(dto.getRegistrationStatus())) {
            throw new RuntimeException("Past events cannot have OPEN registration status. Please choose CLOSED or NOT_REQUIRED.");
        }
    }

    /** Validates that registeredCount does not exceed maxCapacity. */
    private void validateCapacity(EventRequestDTO dto) {
        if (dto.getMaxCapacity() != null && dto.getRegisteredCount() != null) {
            if (dto.getRegisteredCount() > dto.getMaxCapacity()) {
                throw new RuntimeException(
                    "Registered count (" + dto.getRegisteredCount() + ") cannot exceed maximum capacity (" + dto.getMaxCapacity() + ")");
            }
        }
    }

    /** New events require an image; updates may retain legacy records without one. */
    private void validateImageUrl(EventRequestDTO dto) {
        if (dto.getImageUrl() == null || dto.getImageUrl().isBlank()) {
            throw new RuntimeException("Event image URL is required");
        }
    }
}
