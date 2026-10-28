package com.sakhievents.payment;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Mock / Test payment service — DEFAULT implementation — Jatin Patil's module.
 *
 * Active when: payment.mode=mock  (or when property is not set at all).
 * NO real money is moved. This is a demonstration-only payment step.
 *
 * To swap in a real gateway, add a RazorpayPaymentService with:
 *   @ConditionalOnProperty(name = "payment.mode", havingValue = "sandbox")
 * and set payment.mode=sandbox in application.properties (or .env).
 *
 * Keys to add to .env when switching to Razorpay sandbox:
 *   RAZORPAY_KEY_ID=rzp_test_xxxxx
 *   RAZORPAY_KEY_SECRET=xxxxxxxxxxxx
 */
@Service
@ConditionalOnProperty(name = "payment.mode", havingValue = "mock", matchIfMissing = true)
public class MockPaymentService implements PaymentService {

    private static final String MODE = "MOCK/TEST";

    @Override
    public PaymentResult initiatePayment(String bookingRef, BigDecimal amount, String description) {
        // Generate a deterministic mock reference token
        String mockRef = "MOCK-" + bookingRef + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        return new PaymentResult(
                true,
                mockRef,
                "TEST MODE — No real payment processed. This is a sandbox simulation only. Reference: " + mockRef,
                MODE
        );
    }

    @Override
    public boolean verifyPayment(String bookingRef, String paymentReference, String signature) {
        // Mock verification: reference must start with "MOCK-" and contain the bookingRef
        if (paymentReference == null) return false;
        return paymentReference.startsWith("MOCK-") && paymentReference.contains(bookingRef);
    }

    @Override
    public String getMode() {
        return MODE;
    }
}
