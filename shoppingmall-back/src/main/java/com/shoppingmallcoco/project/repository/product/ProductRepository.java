package com.shoppingmallcoco.project.repository.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.shoppingmallcoco.project.entity.product.ProductEntity;

//JpaRepository<엔티티, PK의 타입>
public interface ProductRepository extends JpaRepository<ProductEntity, Long>, JpaSpecificationExecutor<ProductEntity> {
	// JPA가 메소드 이름을 분석해서 쿼리를 자동 생성
	
	long countByStatus(String status);
}
