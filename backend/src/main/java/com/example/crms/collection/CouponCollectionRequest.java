package com.example.crms.collection;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CouponCollectionRequest(
        @NotNull Long customerId,
        Long requirementId,
        boolean couponAvailable,
        String couponNumber,
        BigDecimal couponValue,
        @NotNull BigDecimal productValue,
        Integer quantity,
        BigDecimal collectedAmount,
        String paymentMode,
        Long collectedById,
        @NotNull LocalDate collectionDate
) {
}
