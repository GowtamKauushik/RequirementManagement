package com.example.crms.inventory;

import com.example.crms.audit.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService inventoryService;
    private final AuditService auditService;

    @GetMapping
    public org.springframework.http.ResponseEntity<?> list() {
        List<InventoryItem> items = inventoryService.list();
        if (items.isEmpty()) {
            return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "there is no products available in the inventry"));
        }
        return org.springframework.http.ResponseEntity.ok(items);
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public InventoryUploadResult upload(@RequestParam("file") MultipartFile file, Authentication authentication, HttpServletRequest httpRequest) {
        int count = inventoryService.upload(file);
        auditService.record(authentication.getName(), "INVENTORY", null, "Inventory Upload",
                null, "uploadedCount=" + count + ", fileName=" + file.getOriginalFilename(), auditService.ipAddress(httpRequest));
        return new InventoryUploadResult(count);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public InventoryItem add(@RequestBody InventoryItem item, Authentication authentication) {
        item.setModifiedBy(authentication.getName());
        return inventoryService.save(item);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public InventoryItem update(@PathVariable Long id, @RequestBody InventoryItem item, Authentication authentication) {
        item.setId(id);
        item.setModifiedBy(authentication.getName());
        return inventoryService.save(item);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public org.springframework.http.ResponseEntity<?> delete(@PathVariable Long id) {
        inventoryService.delete(id);
        return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "Inventory item deleted successfully"));
    }
}
