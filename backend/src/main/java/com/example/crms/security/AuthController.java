package com.example.crms.security;

import com.example.crms.audit.AuditService;
import com.example.crms.user.User;
import com.example.crms.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request, HttpServletRequest httpRequest) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = userRepository.findByEmail(request.email()).orElseThrow();
        auditService.record(user.getEmail(), "AUTH", user.getId(), "Login",
                null, "email=" + user.getEmail(), auditService.ipAddress(httpRequest));
        return new AuthResponse(jwtService.generateToken(user), user.getName(), user.getEmail(), user.getRole());
    }
}
