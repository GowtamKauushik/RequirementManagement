package com.example.crms.customer;

import com.example.crms.audit.AuditService;
import com.example.crms.requirement.Requirement;
import com.example.crms.requirement.RequirementRepository;
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
@RequestMapping("/customers")
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class CustomerController {
    private final CustomerRepository customerRepository;
    private final RequirementRepository requirementRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @GetMapping
    public org.springframework.http.ResponseEntity<?> list() {
        List<CustomerDto> list = customerRepository.findAll().stream().map(CustomerDto::from).toList();
        if (list.isEmpty()) {
            return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "no customer data avilable"));
        }
        return org.springframework.http.ResponseEntity.ok(list);
    }

    @GetMapping("/{id}/requirements")
    public org.springframework.http.ResponseEntity<?> requirements(@PathVariable Long id) {
        java.util.List<Requirement> reqs = requirementRepository.findByCustomerId(id);
        if (reqs.isEmpty()) {
            return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "no requiremtn is created yet"));
        }
        return org.springframework.http.ResponseEntity.ok(reqs);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','USER')")
    public CustomerDto create(@Valid @RequestBody CustomerRequest request, Authentication authentication, HttpServletRequest httpRequest) {
        if (customerRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("user already exisit in the create customer");
        }
        Customer customer = applyRequest(new Customer(), request, authentication.getName());
        
        User creator = userRepository.findByEmail(authentication.getName()).orElseThrow();
        if (creator.getRole() == com.example.crms.user.Role.USER) {
            customer.setAssignedUser(creator);
        }

        Customer saved = customerRepository.save(customer);
        CustomerDto dto = CustomerDto.from(saved);
        auditService.record(authentication.getName(), "CUSTOMER", saved.getId(), "Create Customer",
                null, dto.toString(), auditService.ipAddress(httpRequest));
        return dto;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','USER')")
    public CustomerDto update(@PathVariable Long id, @Valid @RequestBody CustomerRequest request, Authentication authentication, HttpServletRequest httpRequest) {
        Customer customer = customerRepository.findById(id).orElseThrow();
        CustomerDto oldValue = CustomerDto.from(customer);
        Customer saved = customerRepository.save(applyRequest(customer, request, authentication.getName()));
        CustomerDto newValue = CustomerDto.from(saved);
        auditService.record(authentication.getName(), "CUSTOMER", id, "Update Customer",
                oldValue.toString(), newValue.toString(), auditService.ipAddress(httpRequest));
        return newValue;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','USER')")
    public org.springframework.http.ResponseEntity<?> delete(@PathVariable Long id, Authentication authentication, HttpServletRequest httpRequest) {
        CustomerDto oldValue = customerRepository.findById(id).map(CustomerDto::from).orElseThrow();
        customerRepository.deleteById(id);
        auditService.record(authentication.getName(), "CUSTOMER", id, "Delete Customer",
                oldValue.toString(), null, auditService.ipAddress(httpRequest));
        return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "customer data deleted successfully"));
    }

    private Customer applyRequest(Customer customer, CustomerRequest request, String modifiedBy) {
        customer.setName(request.name());
        customer.setMobile(request.mobile());
        customer.setEmail(request.email());
        customer.setAddress(request.address());
        User assignedUser = request.assignedUserId() == null
                ? null
                : userRepository.findById(request.assignedUserId()).orElseThrow();
        customer.setAssignedUser(assignedUser);
        customer.setModifiedBy(modifiedBy);
        return customer;
    }
}
