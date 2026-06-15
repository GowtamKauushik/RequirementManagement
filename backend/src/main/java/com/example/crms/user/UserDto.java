package com.example.crms.user;

public record UserDto(Long id, String name, String email, Role role, boolean active, Long assignedAdminId, String assignedAdminName, String createdByEmail) {
    public static UserDto from(User user) {
        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isActive(),
                user.getAssignedAdmin() != null ? user.getAssignedAdmin().getId() : null,
                user.getAssignedAdmin() != null ? user.getAssignedAdmin().getName() : null,
                user.getCreatedByEmail());
    }
}
