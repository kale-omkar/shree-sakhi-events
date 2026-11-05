package com.sakhievents.dto.stall;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response from a successful stall hold.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StallHoldResponse {

    private String holdToken;
    private LocalDateTime expiresAt;
    private Integer ttlMinutes;
    private List<StallDTO> heldStalls;
    private BigDecimal total;
}
