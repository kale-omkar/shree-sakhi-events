package com.sakhievents.repository;

import com.sakhievents.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    // Get all registrations for a specific event
    List<Registration> findByEventIdOrderByRegisteredAtDesc(Long eventId);

    // Check if a person is already registered for an event (by email)
    boolean existsByEventIdAndEmail(Long eventId, String email);

    // Find registration by confirmation code
    Optional<Registration> findByConfirmationCode(String confirmationCode);

    // Count confirmed registrations for an event
    long countByEventIdAndStatus(Long eventId, Registration.RegistrationStatus status);

    // Delete all registrations for an event before event deletion
    @Modifying
    @Transactional
    void deleteByEventId(Long eventId);
}
