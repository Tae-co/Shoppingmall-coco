package com.shoppingmallcoco.project.repository.product;

import com.shoppingmallcoco.project.entity.product.ProductOptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductOptionRepository extends JpaRepository<ProductOptionEntity, Long> {
	
	// 모든 옵션의 재고 합계
	@Query("SELECT COALESCE(SUM(o.stock), 0) FROM ProductOptionEntity o")
    long sumTotalStock();
}
