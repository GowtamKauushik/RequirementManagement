package com.example.crms.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserRequest(
        @NotBlank String name,
        @Email @NotBlank String email,
        String password,
        @NotNull Role role,
        boolean active,
        Long assignedAdminId
) {
}
