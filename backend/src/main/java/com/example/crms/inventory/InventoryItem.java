package com.example.crms.inventory;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Getter
@Setter
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category;
    private String product;
    private String variant;
    private Integer quantity;
    private BigDecimal price;

    private Instant uploadedAt;
    private Instant modifiedAt;
    private String modifiedBy;

    @PrePersist
    void prePersist() {
        uploadedAt = Instant.now();
        modifiedAt = uploadedAt;
    }

    @jakarta.persistence.PreUpdate
    void preUpdate() {
        modifiedAt = Instant.now();
    }
}
