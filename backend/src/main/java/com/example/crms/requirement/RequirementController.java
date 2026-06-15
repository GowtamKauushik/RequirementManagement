package com.example.crms.requirement;

import com.example.crms.audit.AuditService;
import com.example.crms.customer.Customer;
import com.example.crms.customer.CustomerRepository;
import com.example.crms.inventory.InventoryItem;
import com.example.crms.inventory.InventoryRepository;
import com.example.crms.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/requirements")
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class RequirementController {
    private final RequirementRepository requirementRepository;
    private final CustomerRepository customerRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @GetMapping
    public org.springframework.http.ResponseEntity<?> list() {
        java.util.List<Requirement> reqs = requirementRepository.findAll();
        if (reqs.isEmpty()) {
            return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "no requiremtn is created yet"));
        }
        return org.springframework.http.ResponseEntity.ok(reqs);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','USER')")
    public Requirement create(@Valid @RequestBody RequirementRequest request, Authentication authentication, HttpServletRequest httpRequest) {
        if (requirementRepository.existsByCustomerIdAndTitle(request.customerId(), request.title())) {
            throw new IllegalArgumentException("Requirement with this title already exists for this customer");
        }
        Requirement saved = requirementRepository.save(fromRequest(new Requirement(), request, authentication.getName()));
        auditService.record(authentication.getName(), "REQUIREMENT", saved.getId(), "Create Requirement",
                null, snapshot(saved), auditService.ipAddress(httpRequest));
        return saved;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','USER')")
    public Requirement update(@PathVariable Long id, @Valid @RequestBody RequirementRequest request, Authentication authentication, HttpServletRequest httpRequest) {
        Requirement requirement = requirementRepository.findById(id).orElseThrow();
        if (!requirement.getTitle().equalsIgnoreCase(request.title()) && requirementRepository.existsByCustomerIdAndTitle(request.customerId(), request.title())) {
            throw new IllegalArgumentException("Requirement with this title already exists for this customer");
        }
        String oldValue = snapshot(requirement);
        RequirementStatus oldStatus = requirement.getStatus();
        Requirement saved = requirementRepository.save(fromRequest(requirement, request, authentication.getName()));
        String ipAddress = auditService.ipAddress(httpRequest);
        auditService.record(authentication.getName(), "REQUIREMENT", id, "Update Requirement",
                oldValue, snapshot(saved), ipAddress);
        if (oldStatus != saved.getStatus()) {
            auditService.record(authentication.getName(), "REQUIREMENT", id, "Status Change",
                    String.valueOf(oldStatus), String.valueOf(saved.getStatus()), ipAddress);
        }
        return saved;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public org.springframework.http.ResponseEntity<?> delete(@PathVariable Long id, Authentication authentication, HttpServletRequest httpRequest) {
        Requirement requirement = requirementRepository.findById(id).orElseThrow();
        requirementRepository.deleteById(id);
        auditService.record(authentication.getName(), "REQUIREMENT", id, "Delete Requirement",
                snapshot(requirement), null, auditService.ipAddress(httpRequest));
        return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "successfully deleted the requirement"));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public Requirement assignRequirement(@PathVariable Long id, @RequestBody java.util.Map<String, Long> payload, Authentication authentication, HttpServletRequest httpRequest) {
        Requirement requirement = requirementRepository.findById(id).orElseThrow();
        Long userId = payload.get("userId");
        if (userId != null) {
            com.example.crms.user.User user = userRepository.findById(userId).orElseThrow();
            requirement.setAssignedUser(user);
        } else {
            requirement.setAssignedUser(null);
        }
        Requirement saved = requirementRepository.save(requirement);
        auditService.record(authentication.getName(), "REQUIREMENT", id, "Assign Requirement",
                snapshot(requirement), snapshot(saved), auditService.ipAddress(httpRequest));
        return saved;
    }

    private Requirement fromRequest(Requirement requirement, RequirementRequest request, String modifiedBy) {
        Customer customer = customerRepository.findById(request.customerId()).orElseThrow();
        if (request.quantity() != null && request.quantity() > 0) {
            java.util.List<InventoryItem> inventoryItems = inventoryRepository.findByProduct(request.title());
            int totalAvailable = inventoryItems.stream().mapToInt(InventoryItem::getQuantity).sum();
            if (request.quantity() > totalAvailable) {
                throw new IllegalArgumentException("Product out of stock! Requested " + request.quantity() + " but only " + totalAvailable + " available.");
            }
            requirement.setQuantity(request.quantity());
        }

        requirement.setCustomer(customer);
        requirement.setTitle(request.title());
        requirement.setDescription(request.description());
        requirement.setPriority(request.priority() == null ? RequirementPriority.MEDIUM : request.priority());
        requirement.setStatus(request.status() == null ? RequirementStatus.ACTIVE : request.status());
        requirement.setDueDate(request.dueDate());
        requirement.setModifiedBy(modifiedBy);
        return requirement;
    }

    private String snapshot(Requirement requirement) {
        return "customer=" + requirement.getCustomer().getName()
                + ", title=" + requirement.getTitle()
                + ", quantity=" + requirement.getQuantity()
                + ", description=" + requirement.getDescription()
                + ", priority=" + requirement.getPriority()
                + ", status=" + requirement.getStatus()
                + ", dueDate=" + requirement.getDueDate();
    }
}
