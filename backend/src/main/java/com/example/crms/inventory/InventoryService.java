package com.example.crms.inventory;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import com.example.crms.requirement.RequirementRepository;
import com.example.crms.requirement.RequirementStatus;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;
    private final RequirementRepository requirementRepository;
    private final DataFormatter formatter = new DataFormatter();

    public List<InventoryItem> list() {
        return inventoryRepository.findAll();
    }

    public InventoryItem save(InventoryItem item) {
        return inventoryRepository.save(item);
    }

    public void delete(Long id) {
        InventoryItem item = inventoryRepository.findById(id).orElse(null);
        if (item != null) {
            boolean hasActiveOrInProgress = requirementRepository.existsByTitleAndStatusIn(
                    item.getProduct(), 
                    Arrays.asList(RequirementStatus.ACTIVE, RequirementStatus.IN_PROGRESS)
            );
            if (hasActiveOrInProgress) {
                throw new IllegalArgumentException("Cannot delete inventory item: There are ACTIVE or IN_PROGRESS requirements for this product.");
            }
            inventoryRepository.deleteById(id);
        }
    }

    public int upload(MultipartFile file) {
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            List<InventoryItem> existingItems = inventoryRepository.findAll();
            java.util.Map<String, InventoryItem> itemMap = new java.util.HashMap<>();
            for (InventoryItem item : existingItems) {
                String c = item.getCategory() == null ? "" : item.getCategory().trim();
                String p = item.getProduct() == null ? "" : item.getProduct().trim();
                String v = item.getVariant() == null ? "" : item.getVariant().trim();
                String key = (c + "|" + p + "|" + v).toLowerCase();
                itemMap.put(key, item);
            }
            
            List<InventoryItem> itemsToSave = new ArrayList<>();
            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null || isBlank(row)) {
                    continue;
                }
                
                String category = text(row, 1);
                String product = text(row, 2);
                
                if (category.equalsIgnoreCase("Category") || product.equalsIgnoreCase("BRAND")) {
                    continue;
                }
                
                String variant = text(row, 3);
                Integer quantity = integer(row, 4);
                BigDecimal price = decimal(row, 5);
                
                String key = (category + "|" + product + "|" + variant).toLowerCase();
                
                if (itemMap.containsKey(key)) {
                    InventoryItem existing = itemMap.get(key);
                    existing.setQuantity(quantity);
                    existing.setPrice(price);
                    if (!itemsToSave.contains(existing)) {
                        itemsToSave.add(existing);
                    }
                } else {
                    InventoryItem item = new InventoryItem();
                    item.setCategory(category);
                    item.setProduct(product);
                    item.setVariant(variant);
                    item.setQuantity(quantity);
                    item.setPrice(price);
                    itemsToSave.add(item);
                    itemMap.put(key, item);
                }
            }
            inventoryRepository.saveAll(itemsToSave);
            return itemsToSave.size();
        } catch (IOException exception) {
            throw new IllegalArgumentException("Unable to read inventory Excel file");
        }
    }

    private boolean isBlank(Row row) {
        for (int i = 1; i <= 5; i++) {
            if (!text(row, i).isBlank()) {
                return false;
            }
        }
        return true;
    }

    private String text(Row row, int index) {
        if (row.getCell(index) == null) {
            return "";
        }
        return formatter.formatCellValue(row.getCell(index)).trim();
    }

    private Integer integer(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) {
            return 0;
        }
        if (cell.getCellType() == CellType.NUMERIC) {
            return (int) cell.getNumericCellValue();
        }
        String value = formatter.formatCellValue(cell).trim().replace(",", "");
        try {
            return value.isBlank() ? 0 : Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private BigDecimal decimal(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) {
            return BigDecimal.ZERO;
        }
        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue());
        }
        String value = formatter.formatCellValue(cell).trim().replace(",", "");
        try {
            return value.isBlank() ? BigDecimal.ZERO : new BigDecimal(value);
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }
}
