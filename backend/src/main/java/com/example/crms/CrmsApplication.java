package com.example.crms;

import com.example.crms.audit.AuditService;
import com.example.crms.user.Role;
import com.example.crms.user.User;
import com.example.crms.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@RequiredArgsConstructor
public class CrmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(CrmsApplication.class, args);
    }

    @Bean
    CommandLineRunner seed(UserRepository users, PasswordEncoder passwordEncoder, AuditService auditService) {
        return args -> {
            if (users.findByEmail("superadmin@example.com").isEmpty()) {
                User user = User.builder()
                        .name("Super Admin")
                        .email("superadmin@example.com")
                        .password(passwordEncoder.encode("Admin@123"))
                        .role(Role.SUPER_ADMIN)
                        .active(true)
                        .build();
                users.save(user);
                auditService.record("SYSTEM", "USER", user.getId(), "Seeded super admin account");
            }
        };
    }
}
