package com.sakhievents.repository;

import com.sakhievents.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // Get all upcoming events
    List<Event> findByEventTypeOrderByEventDateAsc(Event.EventType eventType);

    // Get featured events
    List<Event> findByIsFeaturedTrueOrderByEventDateAsc();

    // Get events by category
    List<Event> findByCategoryIgnoreCaseOrderByEventDateDesc(String category);

    // Get events with open registration
    List<Event> findByRegistrationStatusOrderByEventDateAsc(Event.RegistrationStatus status);

    // Search events by name or description
    @Query("SELECT e FROM Event e WHERE LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Event> searchEvents(String keyword);

    // Get all past events ordered by most recent
    @Query("SELECT e FROM Event e WHERE e.eventType = 'PAST' ORDER BY e.eventDate DESC")
    List<Event> findPastEventsOrderByDateDesc();

    // ── Admin queries ────────────────────────────────────────────────────

    // Admin: Get all events ordered by most recently created (for admin list view)
    @Query("SELECT e FROM Event e ORDER BY e.createdAt DESC")
    List<Event> findAllOrderByCreatedAtDesc();

    // Admin: Count events by type (for dashboard stats)
    long countByEventType(Event.EventType eventType);

    // Admin: Count events with open registration
    long countByRegistrationStatus(Event.RegistrationStatus status);

    // Admin: Find featured events count
    long countByIsFeaturedTrue();

    // Admin: Find events by category ordered by date
    @Query("SELECT e FROM Event e WHERE e.category = :category ORDER BY e.eventDate DESC")
    List<Event> findByCategoryOrderByEventDateDesc(String category);
}
