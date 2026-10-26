package com.sakhievents.payment;

import java.math.BigDecimal;

/**
 * Payment service interface — Jatin Patil's module.
 *
 * Implementations are selected at runtime via `payment.mode` property:
 *   payment.mode=mock    → MockPaymentService (default — no real money)
 *   payment.mode=sandbox → RazorpayPaymentService (plug in when client confirms gateway)
 *
 * IMPORTANT: Payment is only marked PAID after verifyPayment() returns true on the BACKEND.
 * A frontend success screen alone must never mark a booking as paid.
 */
public interface PaymentService {

    /**
     * Initiate a payment order.
     * Returns a PaymentResult containing an order/reference ID for the client to use.
     *
     * @param bookingRef  Internal booking reference (e.g. SSE-2026-0001)
     * @param amount      Amount in INR (may be null if event is free)
     * @param description Short description shown on the payment page
     */
    PaymentResult initiatePayment(String bookingRef, BigDecimal amount, String description);

    /**
     * Verify the payment callback from the gateway.
     * For Razorpay: validate HMAC-SHA256 signature using the order_id + payment_id + secret.
     * For mock: verify the token starts with "MOCK-".
     *
     * @param bookingRef       Internal booking reference
     * @param paymentReference Gateway payment ID (razorpay_payment_id / mock token)
     * @param signature        Signature string from gateway (razorpay_signature / "mock")
     * @return true only when the payment is cryptographically verified
     */
    boolean verifyPayment(String bookingRef, String paymentReference, String signature);

    /** Human-readable mode label — shown on the payment page to make test mode obvious. */
    String getMode();
}
