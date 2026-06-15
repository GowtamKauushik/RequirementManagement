package com.example.crms.collection;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponCollectionRepository extends JpaRepository<CouponCollection, Long> {
    boolean existsByRequirementId(Long requirementId);
}
