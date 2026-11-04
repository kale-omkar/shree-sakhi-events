package com.sakhievents.repository.booking;

import com.sakhievents.model.booking.BookingStall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * BookingStall repository — Jatin Patil's stall module.
 */
@Repository
public interface BookingStallRepository extends JpaRepository<BookingStall, Long> {

    List<BookingStall> findByBookingId(Long bookingId);

    List<BookingStall> findByStallId(Long stallId);

    boolean existsByBookingIdAndStallId(Long bookingId, Long stallId);

    void deleteByBookingId(Long bookingId);

    List<BookingStall> findByBookingIdIn(List<Long> bookingIds);
}
