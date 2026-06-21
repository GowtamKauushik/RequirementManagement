package com.example.crms.notification;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    private final NotificationRepository repository;
    private final EmailService emailService;

    public NotificationController(NotificationRepository repository, EmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
    }

    @GetMapping
    public List<NotificationDto> getNotifications(Authentication authentication) {
        return repository.findByRecipientEmailOrderByCreatedAtDesc(authentication.getName())
                .stream()
                .map(NotificationDto::from)
                .toList();
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id, Authentication authentication) {
        Notification notification = repository.findById(id).orElseThrow();
        if (notification.getRecipientEmail().equals(authentication.getName())) {
            notification.setRead(true);
            repository.save(notification);
        }
    }

    @PostMapping("/notify")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public void notifyUsers(@RequestBody NotifyRequest request) {
        if (request.emails() != null) {
            for (String email : request.emails()) {
                if (email != null && !email.trim().isEmpty()) {
                    Notification n = new Notification();
                    n.setRecipientEmail(email);
                    n.setMessage(request.message());
                    repository.save(n);
                    
                    try {
                        emailService.sendEmail(email, "New Notification from Vijayam Enterprises", request.message());
                    } catch (Exception e) {
                        // Logged in EmailService
                    }
                }
            }
        }
    }
}

record NotifyRequest(List<String> emails, String message) {}
