package com.sakhievents.dto;

import com.sakhievents.model.Event;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class EventResponseDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDate eventDate;
    private LocalDate endDate;
    private String venue;
    private String venueAddress;
    private String eventType;
    private String registrationStatus;
    private String imageUrl;
    private String bannerUrl;
    private Integer maxCapacity;
    private Integer registeredCount;
    private Integer spotsLeft;
    private List<String> highlights;
    private List<String> tags;
    private String category;
    private String organizer;
    private String contactEmail;
    private String contactPhone;
    private Boolean isFeatured;
    private boolean isRegistrationFull;

    public static EventResponseDTO fromEntity(Event event) {
        EventResponseDTO dto = new EventResponseDTO();
        dto.setId(event.getId());
        dto.setName(event.getName());
        dto.setDescription(event.getDescription());
        dto.setEventDate(event.getEventDate());
        dto.setEndDate(event.getEndDate());
        dto.setVenue(event.getVenue());
        dto.setVenueAddress(event.getVenueAddress());
        dto.setEventType(event.getEventType().name());
        dto.setRegistrationStatus(event.getRegistrationStatus().name());
        dto.setImageUrl(event.getImageUrl());
        dto.setBannerUrl(event.getBannerUrl());
        dto.setMaxCapacity(event.getMaxCapacity());
        dto.setRegisteredCount(event.getRegisteredCount());
        dto.setHighlights(event.getHighlights());
        dto.setTags(event.getTags());
        dto.setCategory(event.getCategory());
        dto.setOrganizer(event.getOrganizer());
        dto.setContactEmail(event.getContactEmail());
        dto.setContactPhone(event.getContactPhone());
        dto.setIsFeatured(event.getIsFeatured());

        if (event.getMaxCapacity() != null && event.getRegisteredCount() != null) {
            dto.setSpotsLeft(event.getMaxCapacity() - event.getRegisteredCount());
            dto.setRegistrationFull(event.getRegisteredCount() >= event.getMaxCapacity());
        }

        return dto;
    }
}
