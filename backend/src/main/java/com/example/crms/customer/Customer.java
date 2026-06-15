package com.example.crms.customer;

import com.example.crms.requirement.Requirement;
import com.example.crms.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @Email
    private String email;

    private String mobile;
    private String address;
    private Instant createdDate;

    @ManyToOne
    private User assignedUser;

    @OneToMany(mappedBy = "customer", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Requirement> requirements = new ArrayList<>();

    @OneToMany(mappedBy = "customer", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<com.example.crms.collection.CouponCollection> collections = new ArrayList<>();

    private Instant modifiedAt;
    private String modifiedBy;

    @PrePersist
    void prePersist() {
        createdDate = Instant.now();
        modifiedAt = createdDate;
    }

    @jakarta.persistence.PreUpdate
    void preUpdate() {
        modifiedAt = Instant.now();
    }
}
