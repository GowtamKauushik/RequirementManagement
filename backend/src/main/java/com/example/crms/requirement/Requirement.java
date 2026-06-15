package com.example.crms.requirement;

import com.example.crms.customer.Customer;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Requirement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JsonIgnoreProperties({"requirements"})
    private Customer customer;

    @ManyToOne
    @JsonIgnoreProperties({"assignedAdmin", "assignedUsers"})
    private com.example.crms.user.User assignedUser;

    @NotBlank
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    private RequirementPriority priority;

    @Enumerated(EnumType.STRING)
    private RequirementStatus status;

    private LocalDate dueDate;

    private Integer quantity;

    @OneToMany(mappedBy = "requirement", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<RequirementHistory> history = new java.util.ArrayList<>();

    private java.time.Instant modifiedAt;
    private String modifiedBy;

    @jakarta.persistence.PrePersist
    void prePersist() {
        modifiedAt = java.time.Instant.now();
    }

    @jakarta.persistence.PreUpdate
    void preUpdate() {
        modifiedAt = java.time.Instant.now();
    }
}
