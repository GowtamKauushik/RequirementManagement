package com.example.crms.user;

import com.example.crms.audit.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
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
@RequestMapping("/users")
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class UserController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public List<UserDto> list(Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return userRepository.findAll().stream()
                .filter(u -> !isAdmin || u.getRole() == Role.USER || u.getEmail().equals(authentication.getName()))
                .map(UserDto::from).toList();
    }

    @GetMapping("/assignable")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public List<UserDto> assignableUsers() {
        return userRepository.findAll().stream()
                .filter(User::isActive)
                .filter(user -> user.getRole() != Role.SUPER_ADMIN)
                .map(UserDto::from)
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public UserDto create(@Valid @RequestBody UserRequest request, Authentication authentication, HttpServletRequest httpRequest) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin && request.role() != Role.USER) {
            throw new IllegalArgumentException("Admins can only create users with USER role");
        }
        String rawPassword = request.password() == null || request.password().isBlank()
                ? "Change@123"
                : request.password();
        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(rawPassword))
                .role(request.role())
                .active(request.active())
                .createdByEmail(authentication.getName())
                .build();
        if (request.assignedAdminId() != null) {
            user.setAssignedAdmin(userRepository.findById(request.assignedAdminId()).orElse(null));
        } else if (isAdmin) {
            user.setAssignedAdmin(userRepository.findByEmail(authentication.getName()).orElse(null));
        }
        userRepository.save(user);
        UserDto dto = UserDto.from(user);
        auditService.record(authentication.getName(), "USER", user.getId(), "Create User",
                null, dto.toString(), auditService.ipAddress(httpRequest));
        return dto;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public UserDto update(@PathVariable Long id, @Valid @RequestBody UserRequest request, Authentication authentication, HttpServletRequest httpRequest) {
        User user = userRepository.findById(id).orElseThrow();
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin && (user.getRole() != Role.USER || request.role() != Role.USER)) {
            throw new IllegalArgumentException("Admins can only update users with USER role");
        }
        UserDto oldValue = UserDto.from(user);
        user.setName(request.name());
        user.setEmail(request.email());
        user.setRole(request.role());
        user.setActive(request.active());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        if (request.assignedAdminId() != null) {
            user.setAssignedAdmin(userRepository.findById(request.assignedAdminId()).orElse(null));
        } else {
            user.setAssignedAdmin(null);
        }
        userRepository.save(user);
        UserDto newValue = UserDto.from(user);
        auditService.record(authentication.getName(), "USER", id, "Update User",
                oldValue.toString(), newValue.toString(), auditService.ipAddress(httpRequest));
        return newValue;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public void delete(@PathVariable Long id, Authentication authentication, HttpServletRequest httpRequest) {
        User user = userRepository.findById(id).orElseThrow();
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            if (user.getRole() != Role.USER) {
                throw new IllegalArgumentException("Admins can only delete users with USER role");
            }
            if (user.getCreatedByEmail() == null || !user.getCreatedByEmail().equals(authentication.getName())) {
                throw new IllegalArgumentException("Admins can only delete users that they created");
            }
        }
        UserDto oldValue = UserDto.from(user);
        userRepository.deleteById(id);
        auditService.record(authentication.getName(), "USER", id, "Delete User",
                oldValue.toString(), null, auditService.ipAddress(httpRequest));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto assignToSelf(@PathVariable Long id, Authentication authentication, HttpServletRequest httpRequest) {
        User user = userRepository.findById(id).orElseThrow();
        if (user.getRole() != Role.USER) {
            throw new IllegalArgumentException("Can only assign USER role users");
        }
        User admin = userRepository.findByEmail(authentication.getName()).orElseThrow();
        user.setAssignedAdmin(admin);
        userRepository.save(user);
        auditService.record(authentication.getName(), "USER", id, "Assign User", null, UserDto.from(user).toString(), auditService.ipAddress(httpRequest));
        return UserDto.from(user);
    }

    @PutMapping("/{id}/unassign")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto unassignFromSelf(@PathVariable Long id, Authentication authentication, HttpServletRequest httpRequest) {
        User user = userRepository.findById(id).orElseThrow();
        if (user.getRole() != Role.USER) {
            throw new IllegalArgumentException("Can only unassign USER role users");
        }
        user.setAssignedAdmin(null);
        userRepository.save(user);
        auditService.record(authentication.getName(), "USER", id, "Unassign User", null, UserDto.from(user).toString(), auditService.ipAddress(httpRequest));
        return UserDto.from(user);
    }

    @PutMapping("/{id}/assign-admin")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public UserDto assignToAdmin(@PathVariable Long id, @RequestBody java.util.Map<String, Long> payload, Authentication authentication, HttpServletRequest httpRequest) {
        User user = userRepository.findById(id).orElseThrow();
        if (user.getRole() != Role.USER) {
            throw new IllegalArgumentException("Can only assign USER role users");
        }
        Long adminId = payload.get("adminId");
        if (adminId != null) {
            User admin = userRepository.findById(adminId).orElseThrow(() -> new IllegalArgumentException("Admin not found"));
            if (admin.getRole() != Role.ADMIN) {
                throw new IllegalArgumentException("Must assign to an ADMIN");
            }
            user.setAssignedAdmin(admin);
            auditService.record(authentication.getName(), "USER", id, "Assign User to Admin", null, "Assigned to Admin ID: " + adminId, auditService.ipAddress(httpRequest));
        } else {
            user.setAssignedAdmin(null);
            auditService.record(authentication.getName(), "USER", id, "Unassign User from Admin", null, "Unassigned", auditService.ipAddress(httpRequest));
        }
        userRepository.save(user);
        return UserDto.from(user);
    }
}
