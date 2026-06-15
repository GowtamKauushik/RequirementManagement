package com.example.crms.customer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CustomerRequest(
        @NotBlank String name,
        String mobile,
        @Email String email,
        String address,
        Long assignedUserId
) {
}
