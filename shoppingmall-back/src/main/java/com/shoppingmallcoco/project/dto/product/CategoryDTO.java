package com.shoppingmallcoco.project.dto.product;

import com.shoppingmallcoco.project.entity.product.CategoryEntity;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CategoryDTO {
    private Long categoryNo;
    private String categoryName;
    private Long parentCategoryNo;
    private LocalDateTime modDate; // 수정일

    public CategoryDTO(CategoryEntity entity) {
        this.categoryNo = entity.getCategoryNo();
        this.categoryName = entity.getCategoryName();
        this.modDate = entity.getModDate();
        
        if (entity.getParentCategory() != null) {
            this.parentCategoryNo = entity.getParentCategory().getCategoryNo();
        }
    }
}