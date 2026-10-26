package com.sakhievents.payment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Result record returned by PaymentService implementations — Jatin Patil's module.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResult {

    /** Whether the payment initiation / verification succeeded */
    private boolean success;

    /** Order ID or payment reference from the gateway (or mock token) */
    private String reference;

    /** Human-readable message to display to the client */
    private String message;

    /** Mode label: "MOCK/TEST" | "RAZORPAY_SANDBOX" | "RAZORPAY_LIVE" */
    private String mode;
}
