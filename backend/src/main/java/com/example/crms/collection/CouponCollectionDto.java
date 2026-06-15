package com.example.crms.collection;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CouponCollectionDto(
        Long id,
        Long customerId,
        String customerName,
        Long requirementId,
        String requirementTitle,
        String customerAssignedUserName,
        boolean couponAvailable,
        String couponNumber,
        BigDecimal couponValue,
        BigDecimal productValue,
        Integer quantity,
        BigDecimal additionalAmount,
        BigDecimal collectedAmount,
        String paymentMode,
        Long collectedById,
        String collectedByName,
        String collectedByEmail,
        LocalDate collectionDate,
        java.time.Instant modifiedAt,
        String modifiedBy,
        String evidencePath,
        boolean paymentVerified,
        String collectorAssignedAdminName,
        String collectorAssignedAdminEmail
) {
    public static CouponCollectionDto from(CouponCollection collection) {
        return new CouponCollectionDto(
                collection.getId(),
                collection.getCustomer().getId(),
                collection.getCustomer().getName(),
                collection.getRequirement() != null ? collection.getRequirement().getId() : null,
                collection.getRequirement() != null ? collection.getRequirement().getTitle() : null,
                collection.getCustomer().getAssignedUser() != null ? collection.getCustomer().getAssignedUser().getName() : null,
                collection.isCouponAvailable(),
                collection.getCouponNumber(),
                collection.getCouponValue(),
                collection.getProductValue(),
                collection.getQuantity(),
                collection.getAdditionalAmount(),
                collection.getCollectedAmount(),
                collection.getPaymentMode(),
                collection.getCollectedBy().getId(),
                collection.getCollectedBy().getName(),
                collection.getCollectedBy().getEmail(),
                collection.getCollectionDate(),
                collection.getModifiedAt(),
                collection.getModifiedBy(),
                collection.getEvidencePath(),
                collection.isPaymentVerified(),
                collection.getCollectedBy() != null && collection.getCollectedBy().getAssignedAdmin() != null ? collection.getCollectedBy().getAssignedAdmin().getName() : null,
                collection.getCollectedBy() != null && collection.getCollectedBy().getAssignedAdmin() != null ? collection.getCollectedBy().getAssignedAdmin().getEmail() : null
        );
    }
}
