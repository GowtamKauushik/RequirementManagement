package com.example.crms.collection;

import com.example.crms.audit.AuditService;
import com.example.crms.customer.Customer;
import com.example.crms.customer.CustomerRepository;
import com.example.crms.user.User;
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
@RequestMapping("/collections")
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class CouponCollectionController {
    private final CouponCollectionRepository collectionRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final com.example.crms.requirement.RequirementRepository requirementRepository;
    private final AuditService auditService;

    @GetMapping
    public org.springframework.http.ResponseEntity<?> list() {
        List<CouponCollectionDto> list = collectionRepository.findAll().stream().map(CouponCollectionDto::from).toList();
        if (list.isEmpty()) {
            return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "there is not collection added yet"));
        }
        return org.springframework.http.ResponseEntity.ok(list);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','USER')")
    public CouponCollectionDto create(@Valid @RequestBody CouponCollectionRequest request, Authentication authentication, HttpServletRequest httpRequest) {
        CouponCollection saved = collectionRepository.save(applyRequest(new CouponCollection(), request, authentication.getName()));
        
        if (saved.getCollectedAmount() == null || saved.getCollectedAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            saved.setPaymentVerified(true);
            saved = collectionRepository.save(saved);
        }
        
        CouponCollectionDto dto = CouponCollectionDto.from(saved);
        auditService.record(authentication.getName(), "COLLECTION", saved.getId(), "Create Coupon Collection",
                null, dto.toString(), auditService.ipAddress(httpRequest));
        return dto;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','USER')")
    public CouponCollectionDto update(@PathVariable Long id, @Valid @RequestBody CouponCollectionRequest request, Authentication authentication, HttpServletRequest httpRequest) {
        CouponCollection collection = collectionRepository.findById(id).orElseThrow();
        CouponCollectionDto oldValue = CouponCollectionDto.from(collection);
        
        // Security Fix: If the amount, mode, or evidence changes, force re-verification
        boolean requiresReverification = false;
        if (request.collectedAmount() != null && collection.getCollectedAmount() != null && request.collectedAmount().compareTo(collection.getCollectedAmount()) != 0) {
            requiresReverification = true;
        }
        if (request.paymentMode() != null && !request.paymentMode().equals(collection.getPaymentMode())) {
            requiresReverification = true;
        }
        
        CouponCollection saved = collectionRepository.save(applyRequest(collection, request, authentication.getName()));
        
        if (saved.getCollectedAmount() == null || saved.getCollectedAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            saved.setPaymentVerified(true);
            saved = collectionRepository.save(saved);
        } else if (requiresReverification) {
            saved.setPaymentVerified(false);
            saved = collectionRepository.save(saved);
        }
        
        CouponCollectionDto newValue = CouponCollectionDto.from(saved);
        auditService.record(authentication.getName(), "COLLECTION", id, "Update Coupon Collection",
                oldValue.toString(), newValue.toString(), auditService.ipAddress(httpRequest));
        return newValue;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','USER')")
    public void delete(@PathVariable Long id, Authentication authentication, HttpServletRequest httpRequest) {
        CouponCollectionDto oldValue = collectionRepository.findById(id).map(CouponCollectionDto::from).orElseThrow();
        collectionRepository.deleteById(id);
        auditService.record(authentication.getName(), "COLLECTION", id, "Delete Coupon Collection",
                oldValue.toString(), null, auditService.ipAddress(httpRequest));
    }

    @DeleteMapping("/{id}/evidence")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','USER')")
    public CouponCollectionDto deleteEvidence(@PathVariable Long id, Authentication authentication, HttpServletRequest httpRequest) {
        CouponCollection collection = collectionRepository.findById(id).orElseThrow();
        CouponCollectionDto oldValue = CouponCollectionDto.from(collection);
        
        collection.setEvidencePath(null);
        collection.setPaymentVerified(false);
        collection.setModifiedBy(authentication.getName());
        collection.setModifiedAt(java.time.Instant.now());
        
        CouponCollection saved = collectionRepository.save(collection);
        CouponCollectionDto newValue = CouponCollectionDto.from(saved);
        auditService.record(authentication.getName(), "COLLECTION", id, "Delete Evidence",
                oldValue.toString(), newValue.toString(), auditService.ipAddress(httpRequest));
        return newValue;
    }

    @PostMapping("/{id}/evidence")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','USER')")
    public CouponCollectionDto uploadEvidence(@PathVariable Long id, @org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file, Authentication authentication, HttpServletRequest httpRequest) throws java.io.IOException {
        CouponCollection collection = collectionRepository.findById(id).orElseThrow();
        CouponCollectionDto oldValue = CouponCollectionDto.from(collection);
        
        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.-]", "_");
        java.nio.file.Path path = java.nio.file.Paths.get("uploads", filename);
        java.nio.file.Files.createDirectories(path.getParent());
        java.nio.file.Files.write(path, file.getBytes());
        
        collection.setEvidencePath("/api/uploads/" + filename);
        collection.setPaymentVerified(false);
        collection.setModifiedBy(authentication.getName());
        collection.setModifiedAt(java.time.Instant.now());
        
        CouponCollection saved = collectionRepository.save(collection);
        CouponCollectionDto newValue = CouponCollectionDto.from(saved);
        auditService.record(authentication.getName(), "COLLECTION", id, "Upload Evidence",
                oldValue.toString(), newValue.toString(), auditService.ipAddress(httpRequest));
        return newValue;
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','USER')")
    public CouponCollectionDto updateVerification(@PathVariable Long id, @org.springframework.web.bind.annotation.RequestParam("verified") boolean verified, Authentication authentication, HttpServletRequest httpRequest) {
        CouponCollection collection = collectionRepository.findById(id).orElseThrow();
        
        boolean isProofRequired = collection.getCollectedAmount() != null && collection.getCollectedAmount().compareTo(java.math.BigDecimal.ZERO) > 0;
        
        if (verified && isProofRequired && (collection.getEvidencePath() == null || collection.getEvidencePath().trim().isEmpty())) {
            throw new IllegalArgumentException("Cannot verify payment without uploaded evidence.");
        }
        
        CouponCollectionDto oldValue = CouponCollectionDto.from(collection);
        
        collection.setPaymentVerified(verified);
        collection.setModifiedBy(authentication.getName());
        collection.setModifiedAt(java.time.Instant.now());
        
        CouponCollection saved = collectionRepository.save(collection);
        CouponCollectionDto newValue = CouponCollectionDto.from(saved);
        auditService.record(authentication.getName(), "COLLECTION", id, "Update Verification Status",
                oldValue.toString(), newValue.toString(), auditService.ipAddress(httpRequest));
        return newValue;
    }

    private CouponCollection applyRequest(CouponCollection collection, CouponCollectionRequest request, String modifiedBy) {
        Customer customer = customerRepository.findById(request.customerId()).orElseThrow();
        User collectedBy;
        if (request.collectedById() != null) {
            collectedBy = userRepository.findById(request.collectedById()).orElseThrow();
        } else {
            collectedBy = userRepository.findByEmail(modifiedBy).orElseThrow();
        }
        collection.setCustomer(customer);
        if (request.requirementId() != null) {
            com.example.crms.requirement.Requirement req = requirementRepository.findById(request.requirementId()).orElseThrow();
            if (collection.getRequirement() == null || !collection.getRequirement().getId().equals(req.getId())) {
                if (req.getStatus() != com.example.crms.requirement.RequirementStatus.IN_PROGRESS) {
                    throw new IllegalArgumentException("Requirement must be in IN_PROGRESS state to be selected for a collection.");
                }
            }
            
            int totalCollectedSoFar = collectionRepository.findByRequirementId(req.getId()).stream()
                    .filter(c -> collection.getId() == null || !c.getId().equals(collection.getId()))
                    .mapToInt(CouponCollection::getQuantity)
                    .sum();
                    
            if (totalCollectedSoFar + request.quantity() > req.getQuantity()) {
                throw new IllegalArgumentException("Cannot collect more than the required quantity (" + req.getQuantity() + "). Already collected: " + totalCollectedSoFar);
            }
            
            collection.setRequirement(req);
        } else {
            collection.setRequirement(null);
        }
        collection.setCouponAvailable(request.couponAvailable());
        collection.setCouponNumber(request.couponNumber());
        collection.setCouponValue(request.couponValue());
        collection.setProductValue(request.productValue());
        collection.setQuantity(request.quantity());
        collection.setCollectedAmount(request.collectedAmount());
        collection.setPaymentMode(request.paymentMode() == null ? "CASH" : request.paymentMode());
        collection.setCollectedBy(collectedBy);
        collection.setCollectionDate(request.collectionDate());
        collection.setModifiedBy(modifiedBy);
        return collection;
    }
}
