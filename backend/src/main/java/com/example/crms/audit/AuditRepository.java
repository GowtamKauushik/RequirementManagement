package com.example.crms.audit;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditRepository extends JpaRepository<AuditTrail, Long> {
}
