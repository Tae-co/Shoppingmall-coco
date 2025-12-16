package com.shoppingmallcoco.project.repository.product;

import com.shoppingmallcoco.project.entity.product.ProductImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductImageRepository extends JpaRepository<ProductImageEntity, Long> {
    
}