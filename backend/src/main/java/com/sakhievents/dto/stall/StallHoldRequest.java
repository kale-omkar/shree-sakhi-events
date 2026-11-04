package com.sakhievents.dto.stall;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request to hold one or more stalls for a session.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StallHoldRequest {

    @NotNull(message = "Event ID is required")
    private Long eventId;

    @NotEmpty(message = "At least one stall must be selected")
    private List<String> stallCodes;

    @NotNull(message = "Session ID is required")
    private String sessionId;
}
