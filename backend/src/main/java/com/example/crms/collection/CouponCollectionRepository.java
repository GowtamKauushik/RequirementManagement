package com.example.crms.collection;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CouponCollectionRepository extends JpaRepository<CouponCollection, Long> {
    boolean existsByRequirementId(Long requirementId);
    List<CouponCollection> findByRequirementId(Long requirementId);
}
