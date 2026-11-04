package com.sakhievents.exception;

/**
 * Thrown when a stall cannot be held because it is already held or booked by
 * another session. Mapped to HTTP 409 Conflict by GlobalExceptionHandler.
 */
public class StallConflictException extends RuntimeException {

    public StallConflictException(String message) {
        super(message);
    }
}
