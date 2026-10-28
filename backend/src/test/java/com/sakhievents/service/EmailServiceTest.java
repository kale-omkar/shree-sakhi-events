package com.sakhievents.service;

import com.sakhievents.model.Enquiry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private EmailService emailService;
    private Enquiry sampleEnquiry;

    @BeforeEach
    void setUp() {
        sampleEnquiry = Enquiry.builder()
                .id(101L)
                .fullName("Priya Sharma")
                .companyName("Artisan Crafts Co.")
                .email("priya@example.com")
                .phone("9876543210")
                .enquiryType("Stall Booking / Exhibition Space")
                .message("Interested in reserving a premier stall for handicrafts.")
                .createdAt(LocalDateTime.of(2026, 10, 25, 14, 30))
                .build();
    }

    @Test
    @DisplayName("When app.mail.enabled is false, email notification is skipped")
    void testSendEnquiryNotification_WhenEmailDisabled_SkipsEmail() {
        emailService = new EmailService(mailSender, false, "shreesakhi26@gmail.com", "noreply@sakhievents.com");

        boolean result = emailService.sendEnquiryNotification(sampleEnquiry);

        assertFalse(result, "Expected notification to return false when email is disabled");
        verifyNoInteractions(mailSender);
    }

    @Test
    @DisplayName("When app.mail.enabled is true, sends email notification to shreesakhi26@gmail.com")
    void testSendEnquiryNotification_WhenEmailEnabled_SendsEmail() {
        emailService = new EmailService(mailSender, true, "shreesakhi26@gmail.com", "noreply@sakhievents.com");

        boolean result = emailService.sendEnquiryNotification(sampleEnquiry);

        assertTrue(result, "Expected notification to return true when email is enabled and successful");

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, times(1)).send(messageCaptor.capture());

        SimpleMailMessage sentMessage = messageCaptor.getValue();
        assertNotNull(sentMessage.getTo());
        assertEquals(1, sentMessage.getTo().length);
        assertEquals("shreesakhi26@gmail.com", sentMessage.getTo()[0]);
        assertEquals("priya@example.com", sentMessage.getReplyTo());
        assertTrue(sentMessage.getSubject().contains("Stall Booking / Exhibition Space"));
        assertTrue(sentMessage.getSubject().contains("Priya Sharma"));
        assertTrue(sentMessage.getText().contains("Artisan Crafts Co."));
        assertTrue(sentMessage.getText().contains("9876543210"));
    }

    @Test
    @DisplayName("When SMTP server throws MailSendException, catches error and returns false without throwing")
    void testSendEnquiryNotification_WhenSmtpThrowsException_CatchesAndReturnsFalse() {
        emailService = new EmailService(mailSender, true, "shreesakhi26@gmail.com", "noreply@sakhievents.com");
        doThrow(new MailSendException("SMTP connection timeout")).when(mailSender).send(any(SimpleMailMessage.class));

        assertDoesNotThrow(() -> {
            boolean result = emailService.sendEnquiryNotification(sampleEnquiry);
            assertFalse(result, "Should return false on failure");
        });

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    @DisplayName("When JavaMailSender is null, skips sending gracefully")
    void testSendEnquiryNotification_WhenMailSenderIsNull_GracefulFallback() {
        emailService = new EmailService(null, true, "shreesakhi26@gmail.com", "noreply@sakhievents.com");

        assertDoesNotThrow(() -> {
            boolean result = emailService.sendEnquiryNotification(sampleEnquiry);
            assertFalse(result);
        });
    }
}
