package com.sakhievents;

import com.sakhievents.dto.BookingRequestDTO;
import com.sakhievents.dto.BookingResponseDTO;
import com.sakhievents.dto.BookingStatusUpdateDTO;
import com.sakhievents.model.Booking;
import com.sakhievents.model.Event;
import com.sakhievents.payment.MockPaymentService;
import com.sakhievents.repository.BookingRepository;
import com.sakhievents.repository.EventRepository;
import com.sakhievents.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private MockPaymentService paymentService;

    @InjectMocks
    private BookingService bookingService;

    private Event upcomingEvent;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(bookingService, "paymentService", paymentService);

        upcomingEvent = new Event();
        upcomingEvent.setId(1L);
        upcomingEvent.setName("Diwali Shopping & Lifestyle Fair 2026");
        upcomingEvent.setEventType(Event.EventType.UPCOMING);
        upcomingEvent.setRegistrationStatus(Event.RegistrationStatus.OPEN);
        upcomingEvent.setEventDate(LocalDate.now().plusDays(30));
        upcomingEvent.setVenue("Balgandharva Kaladalan, JM Road, Pune");
    }

    @Test
    @DisplayName("Should create booking successfully for upcoming event")
    void testCreateBookingSuccess() {
        BookingRequestDTO request = new BookingRequestDTO();
        request.setEventId(1L);
        request.setBookerType(Booking.BookerType.EXHIBITOR);
        request.setFullName("Priya Sharma");
        request.setCompany("Priya Handicrafts");
        request.setPhone("9876543210");
        request.setEmail("priya@example.com");
        request.setQuantity(2);
        request.setMessage("Near entrance preferred");
        request.setConsent(true);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(upcomingEvent));
        when(bookingRepository.existsByEventIdAndEmailIgnoreCase(1L, "priya@example.com")).thenReturn(false);
        when(bookingRepository.countAll()).thenReturn(4L);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(100L);
            return b;
        });

        BookingResponseDTO response = bookingService.createBooking(request);

        assertNotNull(response);
        assertEquals("Priya Sharma", response.getFullName());
        assertEquals("EXHIBITOR", response.getBookerType());
        assertNotNull(response.getBookingRef());
        assertTrue(response.getBookingRef().startsWith("SSE-"));
        assertEquals("PENDING", response.getBookingStatus());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("Should reject booking if event does not exist")
    void testCreateBookingEventNotFound() {
        BookingRequestDTO request = new BookingRequestDTO();
        request.setEventId(999L);
        request.setFullName("Test User");
        request.setPhone("9876543210");
        request.setEmail("test@example.com");
        request.setBookerType(Booking.BookerType.VISITOR);
        request.setQuantity(1);

        when(eventRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(request);
        });

        assertTrue(ex.getMessage().contains("Event not found"));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject booking if event has already passed")
    void testCreateBookingEventInPast() {
        Event pastEvent = new Event();
        pastEvent.setId(2L);
        pastEvent.setName("Past Craft Expo");
        pastEvent.setEventType(Event.EventType.PAST);
        pastEvent.setEventDate(LocalDate.now().minusDays(10));

        BookingRequestDTO request = new BookingRequestDTO();
        request.setEventId(2L);
        request.setFullName("Test User");
        request.setPhone("9876543210");
        request.setEmail("test@example.com");
        request.setBookerType(Booking.BookerType.VISITOR);
        request.setQuantity(1);

        when(eventRepository.findById(2L)).thenReturn(Optional.of(pastEvent));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(request);
        });

        assertTrue(ex.getMessage().contains("past"));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should fetch booking status when reference and email match")
    void testGetBookingStatusSuccess() {
        Booking booking = new Booking();
        booking.setId(1L);
        booking.setBookingRef("SSE-2026-0001");
        booking.setFullName("Jatin Patil");
        booking.setEmail("jatin@example.com");
        booking.setEvent(upcomingEvent);
        booking.setBookingStatus(Booking.BookingStatus.CONFIRMED);
        booking.setPaymentStatus(Booking.PaymentStatus.PAID);
        booking.setAmount(new BigDecimal("2500.00"));

        when(bookingRepository.findByBookingRefAndEmailIgnoreCase("SSE-2026-0001", "jatin@example.com"))
                .thenReturn(Optional.of(booking));

        BookingResponseDTO response = bookingService.getBookingStatus("SSE-2026-0001", "jatin@example.com");

        assertNotNull(response);
        assertEquals("SSE-2026-0001", response.getBookingRef());
        assertEquals("CONFIRMED", response.getBookingStatus());
        assertEquals("PAID", response.getPaymentStatus());
    }

    @Test
    @DisplayName("Should fail status check if email does not match booking reference")
    void testGetBookingStatusWrongEmail() {
        when(bookingRepository.findByBookingRefAndEmailIgnoreCase("SSE-2026-0001", "wrong@email.com"))
                .thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            bookingService.getBookingStatus("SSE-2026-0001", "wrong@email.com");
        });

        assertTrue(ex.getMessage().contains("No booking found"));
    }

    @Test
    @DisplayName("Should verify and confirm payment when signature is valid")
    void testConfirmPaymentSuccess() {
        Booking booking = new Booking();
        booking.setId(1L);
        booking.setBookingRef("SSE-2026-0001");
        booking.setEvent(upcomingEvent);
        booking.setBookingStatus(Booking.BookingStatus.PENDING);
        booking.setPaymentStatus(Booking.PaymentStatus.PENDING);
        booking.setAmount(new BigDecimal("1000.00"));

        when(bookingRepository.findByBookingRef("SSE-2026-0001")).thenReturn(Optional.of(booking));
        when(paymentService.verifyPayment("SSE-2026-0001", "MOCK-REF-123", "mock")).thenReturn(true);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        BookingResponseDTO result = bookingService.confirmPayment("SSE-2026-0001", "MOCK-REF-123", "mock");

        assertEquals("CONFIRMED", result.getBookingStatus());
        assertEquals("PAID", result.getPaymentStatus());
    }

    @Test
    @DisplayName("Should reject payment confirmation if signature verification fails")
    void testConfirmPaymentInvalidSignature() {
        Booking booking = new Booking();
        booking.setBookingRef("SSE-2026-0001");
        booking.setPaymentStatus(Booking.PaymentStatus.PENDING);

        when(bookingRepository.findByBookingRef("SSE-2026-0001")).thenReturn(Optional.of(booking));
        when(paymentService.verifyPayment("SSE-2026-0001", "FAKE-REF", "bad-sig")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            bookingService.confirmPayment("SSE-2026-0001", "FAKE-REF", "bad-sig");
        });

        assertTrue(ex.getMessage().contains("Payment verification failed"));
        assertEquals(Booking.PaymentStatus.FAILED, booking.getPaymentStatus());
    }

    @Test
    @DisplayName("Admin should successfully update booking status")
    void testAdminUpdateBookingStatus() {
        Booking booking = new Booking();
        booking.setId(10L);
        booking.setEvent(upcomingEvent);
        booking.setBookingStatus(Booking.BookingStatus.PENDING);

        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        BookingStatusUpdateDTO updateDTO = new BookingStatusUpdateDTO();
        updateDTO.setBookingStatus(Booking.BookingStatus.CONFIRMED);

        BookingResponseDTO updated = bookingService.updateBookingStatus(10L, updateDTO);

        assertEquals("CONFIRMED", updated.getBookingStatus());
        verify(bookingRepository).save(booking);
    }
}
