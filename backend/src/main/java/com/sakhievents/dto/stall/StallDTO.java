package com.sakhievents.dto.stall;

import com.sakhievents.model.stall.Stall;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Public stall DTO — includes live availability status derived at query time.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StallDTO {

    private Long id;
    private String stallCode;
    private String stallType;
    private String sizeLabel;
    private BigDecimal price;
    private Integer posX;
    private Integer posY;
    private Integer width;
    private Integer height;
    private String status; // AVAILABLE / HELD / BOOKED
    private Boolean isActive;

    public static StallDTO fromEntity(Stall s, String status) {
        return StallDTO.builder()
                .id(s.getId())
                .stallCode(s.getStallCode())
                .stallType(s.getStallType() != null ? s.getStallType().name() : null)
                .sizeLabel(s.getSizeLabel())
                .price(s.getPrice())
                .posX(s.getPosX())
                .posY(s.getPosY())
                .width(s.getWidth())
                .height(s.getHeight())
                .status(status)
                .isActive(s.getIsActive())
                .build();
    }
}
