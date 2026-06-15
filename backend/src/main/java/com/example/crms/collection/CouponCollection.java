package com.example.crms.collection;

import com.example.crms.customer.Customer;
import com.example.crms.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
public class CouponCollection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Customer customer;

    @ManyToOne(optional = true)
    private com.example.crms.requirement.Requirement requirement;

    private boolean couponAvailable;
    private String couponNumber;
    private BigDecimal couponValue;
    private BigDecimal productValue;
    private Integer quantity;
    private BigDecimal additionalAmount;
    private BigDecimal collectedAmount;
    private String paymentMode;
    private String evidencePath;
    private boolean paymentVerified;

    @ManyToOne(optional = false)
    private User collectedBy;

    private LocalDate collectionDate;

    private java.time.Instant modifiedAt;
    private String modifiedBy;

    @PrePersist
    @PreUpdate
    void calculateAdditionalAmount() {
        BigDecimal productCost = productValue == null ? BigDecimal.ZERO : productValue;
        BigDecimal qty = quantity == null ? BigDecimal.ONE : BigDecimal.valueOf(quantity);
        BigDecimal totalProductCost = productCost.multiply(qty);
        BigDecimal couponAmount = couponValue == null ? BigDecimal.ZERO : couponValue;
        additionalAmount = totalProductCost.subtract(couponAmount);
        modifiedAt = java.time.Instant.now();
    }
}
