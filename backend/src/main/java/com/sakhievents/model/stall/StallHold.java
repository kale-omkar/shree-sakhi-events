package com.sakhievents.model.stall;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * StallHold entity — temporary hold on a stall while a user fills their details.
 * Holds expire after a configurable TTL and are cleaned up by a scheduled job.
 * Table: stall_holds
 */
@Entity
@Table(name = "stall_holds")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StallHold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stall_id", nullable = false)
    private Stall stall;

    @Column(nullable = false, length = 64)
    private String holdToken; // client-facing hold token (shared by all stalls in one hold)

    @Column(nullable = false, length = 128)
    private String sessionId; // client session / browser identifier

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
