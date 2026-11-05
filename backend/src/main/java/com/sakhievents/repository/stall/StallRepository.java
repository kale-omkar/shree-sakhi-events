package com.sakhievents.repository.stall;

import com.sakhievents.model.stall.Stall;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Stall repository — Jatin Patil's stall module.
 */
@Repository
public interface StallRepository extends JpaRepository<Stall, Long> {

    List<Stall> findByEventIdOrderByStallCode(Long eventId);

    Optional<Stall> findByEventIdAndStallCode(Long eventId, String stallCode);

    List<Stall> findByEventIdAndStallType(Long eventId, Stall.StallType stallType);

    @Query("SELECT s FROM Stall s WHERE s.event.id = :eventId AND s.isActive = TRUE")
    List<Stall> findActiveByEventId(@Param("eventId") Long eventId);

    boolean existsByEventIdAndStallCode(Long eventId, String stallCode);

    /**
     * Pessimistically lock a stall row for update — serialises concurrent holds.
     */
    @Query("SELECT s FROM Stall s WHERE s.id = :id")
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Stall> findByIdForUpdate(@Param("id") Long id);
}
