package com.sakhievents.service;

import com.sakhievents.dto.RegistrationRequestDTO;
import com.sakhievents.dto.RegistrationResponseDTO;
import com.sakhievents.model.Event;
import com.sakhievents.model.Registration;
import com.sakhievents.repository.EventRepository;
import com.sakhievents.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RegistrationService {

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Transactional
    public RegistrationResponseDTO registerForEvent(RegistrationRequestDTO dto) {

        // 1. Validate event exists
        Event event = eventRepository.findById(dto.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + dto.getEventId()));

        // 2. Check if registration is open
        if (event.getRegistrationStatus() != Event.RegistrationStatus.OPEN) {
            throw new RuntimeException("Registration is not open for this event.");
        }

        // 3. Check capacity
        if (event.getMaxCapacity() != null &&
            event.getRegisteredCount() != null &&
            event.getRegisteredCount() >= event.getMaxCapacity()) {
            throw new RuntimeException("Sorry! This event has reached full capacity.");
        }

        // 4. Check for duplicate registration
        if (registrationRepository.existsByEventIdAndEmail(dto.getEventId(), dto.getEmail())) {
            throw new RuntimeException("You have already registered for this event with email: " + dto.getEmail());
        }

        // 5. Create and save registration
        Registration registration = new Registration();
        registration.setEvent(event);
        registration.setFullName(dto.getFullName());
        registration.setEmail(dto.getEmail());
        registration.setPhone(dto.getPhone());
        registration.setCity(dto.getCity());
        registration.setOrganization(dto.getOrganization());
        registration.setNumberOfAttendees(dto.getNumberOfAttendees() != null ? dto.getNumberOfAttendees() : 1);
        registration.setRemarks(dto.getRemarks());

        Registration saved = registrationRepository.save(registration);

        // 6. Update event's registered count
        event.setRegisteredCount(event.getRegisteredCount() + (dto.getNumberOfAttendees() != null ? dto.getNumberOfAttendees() : 1));
        eventRepository.save(event);

        return RegistrationResponseDTO.fromEntity(saved);
    }

    public Optional<RegistrationResponseDTO> getRegistrationByConfirmationCode(String code) {
        return registrationRepository.findByConfirmationCode(code)
                .map(RegistrationResponseDTO::fromEntity);
    }

    public List<RegistrationResponseDTO> getRegistrationsByEventId(Long eventId) {
        return registrationRepository.findByEventIdOrderByRegisteredAtDesc(eventId)
                .stream()
                .map(RegistrationResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
