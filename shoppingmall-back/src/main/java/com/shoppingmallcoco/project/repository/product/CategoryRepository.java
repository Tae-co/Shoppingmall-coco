package com.shoppingmallcoco.project.repository.product;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shoppingmallcoco.project.entity.product.CategoryEntity;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {

}
