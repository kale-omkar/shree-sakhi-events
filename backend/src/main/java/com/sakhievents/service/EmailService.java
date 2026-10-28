package com.sakhievents.service;

import com.sakhievents.model.Enquiry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.enquiry.recipient-email:shreesakhi26@gmail.com}")
    private String recipientEmail;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public EmailService() {
    }

    // Constructor for explicit dependency injection and unit testing
    public EmailService(JavaMailSender mailSender, boolean mailEnabled, String recipientEmail, String fromEmail) {
        this.mailSender = mailSender;
        this.mailEnabled = mailEnabled;
        this.recipientEmail = recipientEmail;
        this.fromEmail = fromEmail;
    }

    /**
     * Sends an email notification to the official enquiry recipient.
     * All exceptions are caught and logged so that database persistence
     * is not disrupted or rolled back if SMTP is down or misconfigured.
     *
     * @param enquiry the saved enquiry entity
     * @return true if the email was successfully dispatched, false otherwise
     */
    public boolean sendEnquiryNotification(Enquiry enquiry) {
        if (!mailEnabled) {
            log.info("Email notifications are disabled (app.mail.enabled=false). Skipping email notification for enquiry ID: {}", enquiry.getId());
            return false;
        }

        if (mailSender == null) {
            log.warn("JavaMailSender is not available. Skipping email notification for enquiry ID: {}", enquiry.getId());
            return false;
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            String sender = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "no-reply@sakhievents.com";
            mailMessage.setFrom(sender);
            mailMessage.setTo(recipientEmail);
            mailMessage.setReplyTo(enquiry.getEmail());
            mailMessage.setSubject("[Shree Sakhi Events] New Enquiry: " + enquiry.getEnquiryType() + " from " + enquiry.getFullName());
            mailMessage.setText(buildEmailBody(enquiry));

            log.info("Attempting to send enquiry notification email for enquiry ID: {} to {}", enquiry.getId(), recipientEmail);
            mailSender.send(mailMessage);
            log.info("Enquiry notification email successfully delivered to mail server for enquiry ID: {}", enquiry.getId());
            return true;
        } catch (Exception e) {
            log.error("Failed to send enquiry notification email for enquiry ID: {}. Error: {}", enquiry.getId(), e.getMessage());
            // Do NOT rethrow: enquiry is already saved in the database
            return false;
        }
    }

    private String buildEmailBody(Enquiry enquiry) {
        String company = (enquiry.getCompanyName() != null && !enquiry.getCompanyName().isBlank())
                ? enquiry.getCompanyName()
                : "N/A";
        String dateStr = enquiry.getCreatedAt() != null
                ? enquiry.getCreatedAt().format(DATE_FORMATTER)
                : "Just now";

        return """
                New Enquiry Received — Shree Sakhi Events
                ============================================================

                Enquiry ID : #%d
                Received At: %s

                CONTACT DETAILS
                ------------------------------------------------------------
                Full Name   : %s
                Company/Org : %s
                Email       : %s
                Phone       : %s

                ENQUIRY DETAILS
                ------------------------------------------------------------
                Category    : %s

                Message:
                %s

                ============================================================
                This is an automated notification sent to: %s
                """.formatted(
                enquiry.getId(),
                dateStr,
                enquiry.getFullName(),
                company,
                enquiry.getEmail(),
                enquiry.getPhone(),
                enquiry.getEnquiryType(),
                enquiry.getMessage(),
                recipientEmail
        );
    }

    public boolean isMailEnabled() {
        return mailEnabled;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }
}
