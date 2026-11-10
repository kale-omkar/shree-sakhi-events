package com.sakhievents.dto.stall;

import java.io.Serializable;

/**
 * Immutable configuration for a detected stall bounding box.
 * Coordinates and dimensions are normalized as relative percentages (0.0 to 100.0)
 * of the original layout image dimensions, suitable for dynamic CSS/canvas rendering.
 */
public record StallConfiguration(
        String category,
        double xPercent,
        double yPercent,
        double widthPercent,
        double heightPercent
) implements Serializable {

    public StallConfiguration {
        if (category == null || category.isBlank()) {
            throw new IllegalArgumentException("Category must not be null or blank");
        }
        if (xPercent < 0.0 || xPercent > 100.0) {
            throw new IllegalArgumentException("xPercent must be within [0.0, 100.0]: " + xPercent);
        }
        if (yPercent < 0.0 || yPercent > 100.0) {
            throw new IllegalArgumentException("yPercent must be within [0.0, 100.0]: " + yPercent);
        }
        if (widthPercent <= 0.0 || widthPercent > 100.0) {
            throw new IllegalArgumentException("widthPercent must be within (0.0, 100.0]: " + widthPercent);
        }
        if (heightPercent <= 0.0 || heightPercent > 100.0) {
            throw new IllegalArgumentException("heightPercent must be within (0.0, 100.0]: " + heightPercent);
        }
    }

    /**
     * Helper to return rounded percentages for clean JSON serialization.
     */
    public StallConfiguration withPrecision(int decimals) {
        double factor = Math.pow(10, decimals);
        return new StallConfiguration(
                category,
                Math.round(xPercent * factor) / factor,
                Math.round(yPercent * factor) / factor,
                Math.round(widthPercent * factor) / factor,
                Math.round(heightPercent * factor) / factor
        );
    }
}

