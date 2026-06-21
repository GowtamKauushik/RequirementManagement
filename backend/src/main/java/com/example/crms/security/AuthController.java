package com.example.crms.security;

import com.example.crms.audit.AuditService;
import com.example.crms.user.User;
import com.example.crms.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request, HttpServletRequest httpRequest) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        
        User user = userRepository.findByEmail(request.email()).orElseThrow();
        if (jwtService.isTokenValid(user.getActiveToken())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "User already logged in"));
        }
        
        String token = jwtService.generateToken(user);
        user.setActiveToken(token);
        userRepository.save(user);
        
        auditService.record(user.getEmail(), "AUTH", user.getId(), "Login",
                null, "email=" + user.getEmail(), auditService.ipAddress(httpRequest));
        return ResponseEntity.ok(new AuthResponse(token, user.getName(), user.getEmail(), user.getRole()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setActiveToken(null);
            userRepository.save(user);
        });
        return ResponseEntity.ok().build();
    }
}
