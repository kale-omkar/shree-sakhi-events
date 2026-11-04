package com.sakhievents.repository.stall;

import com.sakhievents.model.stall.StallHold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * StallHold repository — Jatin Patil's stall module.
 */
@Repository
public interface StallHoldRepository extends JpaRepository<StallHold, Long> {

    Optional<StallHold> findByHoldToken(String holdToken);

    List<StallHold> findByStallId(Long stallId);

    List<StallHold> findBySessionId(String sessionId);

    List<StallHold> findByExpiresAtBefore(LocalDateTime expiryThreshold);

    void deleteBySessionId(String sessionId);

    void deleteByStallIdAndSessionId(Long stallId, String sessionId);

    void deleteByHoldToken(String holdToken);

    @Query("SELECT h FROM StallHold h WHERE h.expiresAt < :now")    List<StallHold> findExpired(@Param("now") LocalDateTime now);

    void deleteByExpiresAtBefore(LocalDateTime expiryThreshold);
}
