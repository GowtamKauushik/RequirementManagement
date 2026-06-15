package com.example.crms.audit;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditTrail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String actorEmail;
    private String entityType;
    private Long entityId;
    private String action;
    @Lob
    private String oldValue;
    @Lob
    private String newValue;
    private String ipAddress;
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }
}
