package com.example.crms.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditRepository auditRepository;

    public void record(String actorEmail, String entityType, Long entityId, String action) {
        record(actorEmail, entityType, entityId, action, null, null, null);
    }

    public void record(String actorEmail, String entityType, Long entityId, String action,
                       String oldValue, String newValue, String ipAddress) {
        auditRepository.save(AuditTrail.builder()
                .actorEmail(actorEmail)
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .oldValue(oldValue)
                .newValue(newValue)
                .ipAddress(ipAddress)
                .build());
    }

    public String ipAddress(jakarta.servlet.http.HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    public List<AuditTrail> latest() {
        return auditRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}
