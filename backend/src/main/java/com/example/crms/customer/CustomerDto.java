package com.example.crms.customer;

import java.time.Instant;

public record CustomerDto(
        Long id,
        String name,
        String mobile,
        String email,
        String address,
        Long assignedUserId,
        String assignedUserName,
        Instant createdDate,
        Instant modifiedAt,
        String modifiedBy
) {
    public static CustomerDto from(Customer customer) {
        return new CustomerDto(
                customer.getId(),
                customer.getName(),
                customer.getMobile(),
                customer.getEmail(),
                customer.getAddress(),
                customer.getAssignedUser() == null ? null : customer.getAssignedUser().getId(),
                customer.getAssignedUser() == null ? "" : customer.getAssignedUser().getName(),
                customer.getCreatedDate(),
                customer.getModifiedAt(),
                customer.getModifiedBy()
        );
    }
}
