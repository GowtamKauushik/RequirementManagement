package com.example.crms.inventory;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    java.util.List<InventoryItem> findByProduct(String product);
}
