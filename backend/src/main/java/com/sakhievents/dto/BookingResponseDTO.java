package com.sakhievents.dto;

import com.sakhievents.model.Booking;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Safe public response DTO for bookings — Jatin Patil's module.
 * Exposes all booking fields; on the public status endpoint the controller
 * already requires ref+email match, so no extra field masking needed.
 */
@Data
public class BookingResponseDTO {

    private Long id;
    private String bookingRef;
    private Long eventId;
    private String eventName;
    private String eventDate;
    private String eventVenue;
    private String bookerType;
    private String fullName;
    private String company;
    private String phone;
    private String email;
    private Integer quantity;
    private String message;
    private String bookingStatus;
    private String paymentStatus;
    private String paymentReference;
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** Factory method — maps entity to DTO */
    public static BookingResponseDTO fromEntity(Booking b) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setId(b.getId());
        dto.setBookingRef(b.getBookingRef());
        if (b.getEvent() != null) {
            dto.setEventId(b.getEvent().getId());
            dto.setEventName(b.getEvent().getName());
            dto.setEventDate(b.getEvent().getEventDate() != null
                    ? b.getEvent().getEventDate().toString() : null);
            dto.setEventVenue(b.getEvent().getVenue());
        }
        dto.setBookerType(b.getBookerType() != null ? b.getBookerType().name() : null);
        dto.setFullName(b.getFullName());
        dto.setCompany(b.getCompany());
        dto.setPhone(b.getPhone());
        dto.setEmail(b.getEmail());
        dto.setQuantity(b.getQuantity());
        dto.setMessage(b.getMessage());
        dto.setBookingStatus(b.getBookingStatus() != null ? b.getBookingStatus().name() : null);
        dto.setPaymentStatus(b.getPaymentStatus() != null ? b.getPaymentStatus().name() : null);
        dto.setPaymentReference(b.getPaymentReference());
        dto.setAmount(b.getAmount());
        dto.setCreatedAt(b.getCreatedAt());
        dto.setUpdatedAt(b.getUpdatedAt());
        return dto;
    }
}
