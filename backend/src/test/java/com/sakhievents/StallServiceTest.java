package com.sakhievents.service.stall;

import com.sakhievents.dto.stall.StallHoldRequest;
import com.sakhievents.exception.StallConflictException;
import com.sakhievents.model.Booking.BookingStatus;
import com.sakhievents.model.stall.Stall;
import com.sakhievents.model.stall.StallHold;
import com.sakhievents.repository.booking.BookingStallRepository;
import com.sakhievents.repository.stall.StallHoldRepository;
import com.sakhievents.repository.stall.StallRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StallServiceTest {

    @Mock
    private StallRepository stallRepository;

    @Mock
    private StallHoldRepository stallHoldRepository;

    @Mock
    private BookingStallRepository bookingStallRepository;

    @InjectMocks
    private StallService stallService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(stallService, "holdTtlMinutes", 10);
        ReflectionTestUtils.setField(stallService, "maxStallsPerBooking", 5);
    }

    @Test
    @DisplayName("holdStalls - succeeds and returns hold token when stalls are free")
    void testHoldStallsSuccess() {
        Stall s1 = stall("12", new BigDecimal("4000.00"));
        Stall s2 = stall("13", new BigDecimal("4000.00"));

        when(stallRepository.findByEventIdAndStallCode(1L, "12")).thenReturn(Optional.of(s1));
        when(stallRepository.findByEventIdAndStallCode(1L, "13")).thenReturn(Optional.of(s2));
        when(stallRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(s1));
        when(stallRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(s2));
        when(bookingStallRepository.findByStallId(1L)).thenReturn(List.of());
        when(bookingStallRepository.findByStallId(2L)).thenReturn(List.of());
        when(stallHoldRepository.findByStallId(1L)).thenReturn(List.of());
        when(stallHoldRepository.findByStallId(2L)).thenReturn(List.of());

        StallHoldRequest req = new StallHoldRequest();
        req.setEventId(1L);
        req.setStallCodes(List.of("12", "13"));
        req.setSessionId("sess-1");

        var resp = stallService.holdStalls(req);

        assertNotNull(resp.getHoldToken());
        assertEquals(new BigDecimal("8000.00"), resp.getTotal());
        assertEquals(2, resp.getHeldStalls().size());
        verify(stallHoldRepository, times(2)).save(any(StallHold.class));
    }

    @Test
    @DisplayName("holdStalls - throws 409 when stall already booked")
    void testHoldStallsBookedConflict() {
        Stall s1 = stall("12", new BigDecimal("4000.00"));
        when(stallRepository.findByEventIdAndStallCode(1L, "12")).thenReturn(Optional.of(s1));
        when(stallRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(s1));
        when(bookingStallRepository.findByStallId(1L))
                .thenReturn(List.of(bookingStall(BookingStatus.CONFIRMED)));

        StallHoldRequest req = new StallHoldRequest();
        req.setEventId(1L);
        req.setStallCodes(List.of("12"));
        req.setSessionId("sess-1");

        StallConflictException ex = assertThrows(StallConflictException.class,
                () -> stallService.holdStalls(req));
        assertTrue(ex.getMessage().contains("already booked"));
    }

    @Test
    @DisplayName("holdStalls - throws 409 when stall held by another session")
    void testHoldStallsHeldByOther() {
        Stall s1 = stall("12", new BigDecimal("4000.00"));
        StallHold otherHold = StallHold.builder()
                .stall(s1).holdToken("tok-other").sessionId("sess-other")
                .expiresAt(LocalDateTime.now().plusMinutes(10)).build();

        when(stallRepository.findByEventIdAndStallCode(1L, "12")).thenReturn(Optional.of(s1));
        when(stallRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(s1));
        when(bookingStallRepository.findByStallId(1L)).thenReturn(List.of());
        when(stallHoldRepository.findByStallId(1L)).thenReturn(List.of(otherHold));

        StallHoldRequest req = new StallHoldRequest();
        req.setEventId(1L);
        req.setStallCodes(List.of("12"));
        req.setSessionId("sess-1");

        StallConflictException ex = assertThrows(StallConflictException.class,
                () -> stallService.holdStalls(req));
        assertTrue(ex.getMessage().contains("held by another user"));
    }

    @Test
    @DisplayName("validateAndConsumeHold - throws 409 when token expired")
    void testValidateConsumeHoldExpired() {
        Stall s1 = stall("12", new BigDecimal("4000.00"));
        StallHold expired = StallHold.builder()
                .stall(s1).holdToken("tok-exp").sessionId("sess-1")
                .expiresAt(LocalDateTime.now().minusMinutes(1)).build();

        when(stallHoldRepository.findByHoldToken("tok-exp")).thenReturn(Optional.of(expired));

        StallConflictException ex = assertThrows(StallConflictException.class,
                () -> stallService.validateAndConsumeHold(1L, List.of("12"), "tok-exp", "sess-1"));
        assertTrue(ex.getMessage().contains("expired"));
    }

    @Test
    @DisplayName("validateAndConsumeHold - computes backend total from DB prices")
    void testValidateConsumeHoldTotal() {
        Stall s1 = stall("12", new BigDecimal("5000.00"));
        Stall s2 = stall("A", new BigDecimal("2500.00"));
        StallHold hold = StallHold.builder()
                .stall(s1).holdToken("tok-ok").sessionId("sess-1")
                .expiresAt(LocalDateTime.now().plusMinutes(10)).build();

        when(stallHoldRepository.findByHoldToken("tok-ok")).thenReturn(Optional.of(hold));
        when(stallRepository.findByEventIdAndStallCode(1L, "12")).thenReturn(Optional.of(s1));
        when(stallRepository.findByEventIdAndStallCode(1L, "A")).thenReturn(Optional.of(s2));
        when(stallRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(s1));
        when(stallRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(s2));
        when(bookingStallRepository.findByStallId(1L)).thenReturn(List.of());
        when(bookingStallRepository.findByStallId(2L)).thenReturn(List.of());

        BigDecimal total = stallService.validateAndConsumeHold(1L, List.of("12", "A"), "tok-ok", "sess-1");

        assertEquals(new BigDecimal("7500.00"), total);
        verify(stallHoldRepository).deleteByHoldToken("tok-ok"); // hold consumed
    }

    private Stall stall(String code, BigDecimal price) {
        Stall s = new Stall();
        s.setId(code.equals("12") ? 1L : 2L);
        s.setStallCode(code);
        s.setPrice(price);
        return s;
    }

    private com.sakhievents.model.booking.BookingStall bookingStall(BookingStatus status) {
        com.sakhievents.model.Booking b = new com.sakhievents.model.Booking();
        b.setBookingStatus(status);
        com.sakhievents.model.booking.BookingStall bs = new com.sakhievents.model.booking.BookingStall();
        bs.setBooking(b);
        return bs;
    }
}
