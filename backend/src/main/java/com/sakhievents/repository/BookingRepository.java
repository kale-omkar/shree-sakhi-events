package com.sakhievents.repository;

import com.sakhievents.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Booking repository — Jatin Patil's module.
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingRef(String bookingRef);

    /** Used for public status check — requires both ref AND email to prevent enumeration */
    Optional<Booking> findByBookingRefAndEmailIgnoreCase(String bookingRef, String email);

    /** Duplicate booking guard — one booking per email per event */
    boolean existsByEventIdAndEmailIgnoreCase(Long eventId, String email);

    List<Booking> findByEventIdOrderByCreatedAtDesc(Long eventId);

    List<Booking> findByBookingStatusOrderByCreatedAtDesc(Booking.BookingStatus bookingStatus);

    @Query("SELECT b FROM Booking b ORDER BY b.createdAt DESC")
    List<Booking> findAllOrderByCreatedAtDesc();

    @Query("SELECT b FROM Booking b WHERE b.event.id = :eventId AND b.bookingStatus = :status ORDER BY b.createdAt DESC")
    List<Booking> findByEventIdAndBookingStatus(
            @Param("eventId") Long eventId,
            @Param("status")  Booking.BookingStatus status);

    /** Active bookings count (not cancelled) — for capacity check */
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.event.id = :eventId AND b.bookingStatus != 'CANCELLED'")
    long countActiveByEventId(@Param("eventId") Long eventId);

    /** Total booking count — used for generating sequential booking refs */
    @Query("SELECT COUNT(b) FROM Booking b")
    long countAll();
}
