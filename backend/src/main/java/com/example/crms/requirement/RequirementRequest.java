package com.example.crms.requirement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record RequirementRequest(
        @NotNull Long customerId,
        @NotBlank String title,
        String description,
        RequirementPriority priority,
        RequirementStatus status,
        LocalDate dueDate,
        Integer quantity
) {
}
