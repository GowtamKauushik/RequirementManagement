package com.example.crms.notification;

import java.time.Instant;

public record NotificationDto(
    Long id,
    String message,
    boolean isRead,
    Instant createdAt
) {
    public static NotificationDto from(Notification notification) {
        return new NotificationDto(
            notification.getId(),
            notification.getMessage(),
            notification.isRead(),
            notification.getCreatedAt()
        );
    }
}
