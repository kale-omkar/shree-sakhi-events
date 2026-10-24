package com.sakhievents.service;

import com.sakhievents.dto.EventResponseDTO;
import com.sakhievents.model.Event;
import com.sakhievents.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public List<EventResponseDTO> getAllEvents() {
        return eventRepository.findAll()
                .stream()
                .map(EventResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Optional<EventResponseDTO> getEventById(Long id) {
        return eventRepository.findById(id)
                .map(EventResponseDTO::fromEntity);
    }

    public List<EventResponseDTO> getUpcomingEvents() {
        return eventRepository.findByEventTypeOrderByEventDateAsc(Event.EventType.UPCOMING)
                .stream()
                .map(EventResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<EventResponseDTO> getPastEvents() {
        return eventRepository.findPastEventsOrderByDateDesc()
                .stream()
                .map(EventResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<EventResponseDTO> getFeaturedEvents() {
        return eventRepository.findByIsFeaturedTrueOrderByEventDateAsc()
                .stream()
                .map(EventResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<EventResponseDTO> searchEvents(String keyword) {
        return eventRepository.searchEvents(keyword)
                .stream()
                .map(EventResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Event saveEvent(Event event) {
        return eventRepository.save(event);
    }

    /**
     * Seeds initial historical exhibition data into the database if empty.
     * Sourced strictly from the official 'Details About Shree Sakhi Events' PDF.
     * Only historical exhibitions with verified dates and venues are seeded.
     * The 26-27 September event is excluded because its year is unconfirmed.
     * No fictional upcoming exhibitions are seeded.
     */
    public void seedEventsIfEmpty() {
        if (eventRepository.count() > 0) return;

        // Historical Exhibition 1: 23-24 August 2025 @ Patidar Bhavan
        Event exhibition1 = new Event();
        exhibition1.setName("Grand Exhibition @ Patidar Bhavan");
        exhibition1.setDescription(
            "Shree Sakhi Events proudly hosted its Grand Exhibition on 23rd & 24th August 2025, at Patidar Bhavan, " +
            "Nashik Road, Nashik bringing together talented entrepreneurs, shoppers under one roof. With an incredible " +
            "footfall of 2,500+ visitors and 65+ stalls, the exhibition created a vibrant platform for women entrepreneurs " +
            "to show with customers, promote their businesses, and turn their dreams into reality. Our exhibition was " +
            "more than just a shopping event—it was a celebration of women's empowerment, entrepreneurship, creativity, " +
            "an overwhelming response from visitors and exhibitors made the event a memorable success. " +
            "Our Valued Sponsors: Main Sponsor: R M Silver | Co-Sponsor: Patole Diagnostic Centre | Associate Sponsor: Food Basket."
        );
        exhibition1.setEventDate(LocalDate.of(2025, 8, 23));
        exhibition1.setEndDate(LocalDate.of(2025, 8, 24));
        exhibition1.setVenue("Patidar Bhavan");
        exhibition1.setVenueAddress("Patidar Bhavan, Nashik Road, Nashik");
        exhibition1.setEventType(Event.EventType.PAST);
        exhibition1.setRegistrationStatus(Event.RegistrationStatus.CLOSED);
        exhibition1.setMaxCapacity(2500);
        exhibition1.setRegisteredCount(2500);
        exhibition1.setCategory("Exhibition");
        exhibition1.setOrganizer("Shree Sakhi Events");
        exhibition1.setContactPhone("9145683687");
        exhibition1.setIsFeatured(true);
        exhibition1.setHighlights(Arrays.asList(
            "2,500+ visitor footfall",
            "65+ women entrepreneur stalls",
            "Main Sponsor: R M Silver",
            "Co-Sponsor: Patole Diagnostic Centre",
            "Associate Sponsor: Food Basket"
        ));
        exhibition1.setTags(Arrays.asList("Exhibition", "Women Empowerment", "Patidar Bhavan", "Nashik Road", "August 2025"));
        eventRepository.save(exhibition1);

        // Historical Exhibition 2: 11-12 October 2025 @ Rajmata Mangal Karyalay
        Event exhibition2 = new Event();
        exhibition2.setName("Second Grand Exhibition @ Rajmata Mangal Karyalay");
        exhibition2.setDescription(
            "Shree Sakhi Events proudly hosted its Second Grand Exhibition on 11, 12 October 2025 @ Rajmata Mangal Karyalay, " +
            "Rasbihari Link Road, Meri, Nashik bringing together talented entrepreneurs, shoppers under one roof. With an " +
            "incredible footfall of 2,500+ visitors and 65+ stalls, the exhibition created a vibrant platform for women entrepreneurs " +
            "to show with customers, promote their businesses, and turn their dreams into reality. Our exhibition was more than " +
            "just a shopping event—it was a celebration of women's empowerment, entrepreneurship, creativity, an overwhelming " +
            "response from visitors and exhibitors made the event a memorable success. " +
            "Our Valued Sponsors: Title Sponsor: Dr. Nidhi's Multispecialty Clinic | Associated Sponsor: Dhobi Junction."
        );
        exhibition2.setEventDate(LocalDate.of(2025, 10, 11));
        exhibition2.setEndDate(LocalDate.of(2025, 10, 12));
        exhibition2.setVenue("Rajmata Mangal Karyalay");
        exhibition2.setVenueAddress("Rajmata Mangal Karyalay, Rasbihari Link Road, Meri, Nashik");
        exhibition2.setEventType(Event.EventType.PAST);
        exhibition2.setRegistrationStatus(Event.RegistrationStatus.CLOSED);
        exhibition2.setMaxCapacity(2500);
        exhibition2.setRegisteredCount(2500);
        exhibition2.setCategory("Exhibition");
        exhibition2.setOrganizer("Shree Sakhi Events");
        exhibition2.setContactPhone("9145683687");
        exhibition2.setIsFeatured(true);
        exhibition2.setHighlights(Arrays.asList(
            "2,500+ visitor footfall",
            "65+ women entrepreneur stalls",
            "Title Sponsor: Dr. Nidhi's Multispecialty Clinic",
            "Associated Sponsor: Dhobi Junction"
        ));
        exhibition2.setTags(Arrays.asList("Exhibition", "Women Empowerment", "Rajmata Mangal Karyalay", "Meri", "October 2025"));
        eventRepository.save(exhibition2);

        System.out.println("✅ Documented historical exhibitions seeded successfully into the database.");
    }
}
