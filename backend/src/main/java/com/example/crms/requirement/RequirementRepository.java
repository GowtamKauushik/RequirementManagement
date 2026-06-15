package com.example.crms.requirement;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequirementRepository extends JpaRepository<Requirement, Long> {
    List<Requirement> findByCustomerId(Long customerId);
    boolean existsByCustomerIdAndTitle(Long customerId, String title);
    boolean existsByTitleAndStatusIn(String title, List<RequirementStatus> statuses);
}
