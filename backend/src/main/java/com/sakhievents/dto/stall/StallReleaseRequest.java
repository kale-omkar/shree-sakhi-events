package com.sakhievents.dto.stall;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to release a stall hold (by token or session id).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StallReleaseRequest {

    @NotBlank(message = "Hold token or session ID is required")
    private String holdToken; // optional; if blank, sessionId is used

    private String sessionId; // optional fallback
}
