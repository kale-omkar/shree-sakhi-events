package com.sakhievents.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Event name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Description is required")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @NotNull(message = "Event date is required")
    @Column(nullable = false)
    private LocalDate eventDate;

    private LocalDate endDate; // for multi-day events

    @NotBlank(message = "Venue is required")
    @Column(nullable = false)
    private String venue;

    private String venueAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType eventType; // UPCOMING, ONGOING, PAST

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus registrationStatus; // OPEN, CLOSED, COMING_SOON, NOT_REQUIRED

    private String imageUrl;   // cover / thumbnail (first image)

    private String bannerUrl;  // hero banner at top of detail page

    @ElementCollection
    @CollectionTable(name = "event_images", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "image_url", length = 1000)
    private List<String> images; // additional gallery images

    private Integer maxCapacity;

    private Integer registeredCount;

    @ElementCollection
    @CollectionTable(name = "event_highlights", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "highlight")
    private List<String> highlights;

    @ElementCollection
    @CollectionTable(name = "event_tags", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "tag")
    private List<String> tags;

    private String category; // e.g. Exhibition, Workshop, Cultural, etc.

    private String organizer;

    private String contactEmail;

    private String contactPhone;

    private Boolean isFeatured;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Registration> registrations;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (registeredCount == null) registeredCount = 0;
        if (isFeatured == null) isFeatured = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum EventType {
        UPCOMING, ONGOING, PAST
    }

    public enum RegistrationStatus {
        OPEN, CLOSED, COMING_SOON, NOT_REQUIRED
    }
}
