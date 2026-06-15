package com.example.crms.requirement;

import com.example.crms.user.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class RequirementHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JsonIgnoreProperties({"history", "customer"})
    private Requirement requirement;

    @Enumerated(EnumType.STRING)
    private RequirementStatus oldStatus;

    @Enumerated(EnumType.STRING)
    private RequirementStatus newStatus;

    private String remarks;

    @ManyToOne(optional = false)
    private User changedBy;

    private LocalDateTime changedAt;
}
