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

    // Seed initial demo events into the database if empty
    public void seedEventsIfEmpty() {
        if (eventRepository.count() > 0) return;

        // Event 1 - Nashik Exhibition (Ongoing/Upcoming - main featured event)
        Event nashikExhibition = new Event();
        nashikExhibition.setName("Nashik Mahila Udyog Mela 2026");
        nashikExhibition.setDescription(
            "Shree Sakhi Events proudly presents the Nashik Mahila Udyog Mela 2026 — a grand two-month exhibition celebrating women entrepreneurs from Nashik and beyond. " +
            "This exclusive platform brings together talented women artisans, home-based businesses, self-help groups, and women-led startups to showcase their products and services. " +
            "Visitors can explore a wide range of handmade crafts, organic foods, fashion, jewellery, home decor, and much more — all created by women for the world. " +
            "A spectacular celebration of women's empowerment, creativity, and business spirit."
        );
        nashikExhibition.setEventDate(LocalDate.of(2026, 10, 15));
        nashikExhibition.setEndDate(LocalDate.of(2026, 12, 15));
        nashikExhibition.setVenue("Nashik Municipal Exhibition Ground");
        nashikExhibition.setVenueAddress("Near CBS Bus Stand, Nashik, Maharashtra 422001");
        nashikExhibition.setEventType(Event.EventType.UPCOMING);
        nashikExhibition.setRegistrationStatus(Event.RegistrationStatus.OPEN);
        nashikExhibition.setMaxCapacity(5000);
        nashikExhibition.setRegisteredCount(127);
        nashikExhibition.setCategory("Exhibition");
        nashikExhibition.setOrganizer("Shree Sakhi Events");
        nashikExhibition.setContactEmail("info@sakhievents.com");
        nashikExhibition.setContactPhone("+91 98765 43210");
        nashikExhibition.setIsFeatured(true);
        nashikExhibition.setHighlights(Arrays.asList(
            "200+ women entrepreneur stalls",
            "Live cooking demonstrations",
            "Cultural performances every weekend",
            "Fashion shows by local designers",
            "Children's activity zone",
            "Free entry for all visitors"
        ));
        nashikExhibition.setTags(Arrays.asList("Exhibition", "Women Empowerment", "Nashik", "Entrepreneurship", "Free Entry"));
        eventRepository.save(nashikExhibition);

        // Event 2 - Past Event: Women's Day Celebration 2026
        Event womensDayCelebration = new Event();
        womensDayCelebration.setName("Sakhi Samman — Women's Day Celebration 2026");
        womensDayCelebration.setDescription(
            "A heartfelt celebration of women's achievements, resilience, and dreams. " +
            "Sakhi Samman brought together over 500 women from Nashik for an evening of inspiration, awards, cultural performances, and sisterhood. " +
            "Distinguished women leaders were felicitated for their contributions to society, business, and arts. " +
            "The event featured motivational talks, dance performances, and a special fashion show by women entrepreneurs."
        );
        womensDayCelebration.setEventDate(LocalDate.of(2026, 3, 8));
        womensDayCelebration.setVenue("Hotel Sai Palace Banquet Hall");
        womensDayCelebration.setVenueAddress("College Road, Nashik, Maharashtra");
        womensDayCelebration.setEventType(Event.EventType.PAST);
        womensDayCelebration.setRegistrationStatus(Event.RegistrationStatus.CLOSED);
        womensDayCelebration.setMaxCapacity(600);
        womensDayCelebration.setRegisteredCount(543);
        womensDayCelebration.setCategory("Cultural");
        womensDayCelebration.setOrganizer("Shree Sakhi Events");
        womensDayCelebration.setContactEmail("info@sakhievents.com");
        womensDayCelebration.setContactPhone("+91 98765 43210");
        womensDayCelebration.setIsFeatured(false);
        womensDayCelebration.setHighlights(Arrays.asList(
            "500+ women attendees",
            "Awards for 25 inspiring women",
            "Keynote by renowned women leaders",
            "Cultural dance performances",
            "Felicitation ceremony"
        ));
        womensDayCelebration.setTags(Arrays.asList("Women's Day", "Celebration", "Awards", "Cultural", "Nashik"));
        eventRepository.save(womensDayCelebration);

        // Event 3 - Past Event: Navratri Utsav 2025
        Event navratri = new Event();
        navratri.setName("Sakhi Navratri Utsav 2025");
        navratri.setDescription(
            "Nine nights of devotion, dance, and festivity! Sakhi Navratri Utsav 2025 was a spectacular nine-day celebration " +
            "of the divine feminine with traditional Garba, Dandiya, and cultural performances. " +
            "Thousands of participants from across Nashik and neighboring cities came together in traditional attire " +
            "to celebrate the spirit of Navratri. The event featured live music by renowned artists, competitions, and prizes."
        );
        navratri.setEventDate(LocalDate.of(2025, 10, 2));
        navratri.setEndDate(LocalDate.of(2025, 10, 10));
        navratri.setVenue("Nashik Sports Complex");
        navratri.setVenueAddress("Gangapur Road, Nashik, Maharashtra");
        navratri.setEventType(Event.EventType.PAST);
        navratri.setRegistrationStatus(Event.RegistrationStatus.CLOSED);
        navratri.setMaxCapacity(10000);
        navratri.setRegisteredCount(8765);
        navratri.setCategory("Cultural Festival");
        navratri.setOrganizer("Shree Sakhi Events");
        navratri.setContactEmail("info@sakhievents.com");
        navratri.setContactPhone("+91 98765 43210");
        navratri.setIsFeatured(false);
        navratri.setHighlights(Arrays.asList(
            "9 nights of Garba & Dandiya",
            "Live music by top artists",
            "Traditional costume competitions",
            "8000+ participants",
            "Special prize distribution"
        ));
        navratri.setTags(Arrays.asList("Navratri", "Garba", "Dandiya", "Festival", "Cultural"));
        eventRepository.save(navratri);

        // Event 4 - Upcoming Workshop
        Event workshop = new Event();
        workshop.setName("Women Entrepreneurship Masterclass 2026");
        workshop.setDescription(
            "A power-packed one-day masterclass designed exclusively for aspiring and existing women entrepreneurs of Nashik. " +
            "Learn the secrets of starting, growing, and scaling a successful business from industry experts and successful women business owners. " +
            "Topics include business planning, digital marketing, financial management, branding, and government schemes for women entrepreneurs. " +
            "Limited seats — register early to secure your spot!"
        );
        workshop.setEventDate(LocalDate.of(2026, 11, 20));
        workshop.setVenue("Nashik Management Association");
        workshop.setVenueAddress("Tilak Road, Nashik, Maharashtra 422002");
        workshop.setEventType(Event.EventType.UPCOMING);
        workshop.setRegistrationStatus(Event.RegistrationStatus.OPEN);
        workshop.setMaxCapacity(100);
        workshop.setRegisteredCount(67);
        workshop.setCategory("Workshop");
        workshop.setOrganizer("Shree Sakhi Events");
        workshop.setContactEmail("info@sakhievents.com");
        workshop.setContactPhone("+91 98765 43210");
        workshop.setIsFeatured(true);
        workshop.setHighlights(Arrays.asList(
            "Expert speakers from top industries",
            "Hands-on business planning session",
            "Networking lunch included",
            "Certificate of participation",
            "Government scheme guidance"
        ));
        workshop.setTags(Arrays.asList("Workshop", "Entrepreneurship", "Business", "Women", "Learning"));
        eventRepository.save(workshop);

        System.out.println("✅ Demo events seeded successfully into the database.");
    }
}
