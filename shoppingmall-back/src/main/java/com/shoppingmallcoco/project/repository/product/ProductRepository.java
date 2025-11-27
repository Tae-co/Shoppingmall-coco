package com.shoppingmallcoco.project.repository.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.shoppingmallcoco.project.entity.product.ProductEntity;

/**
 * 상품 데이터 접근을 위한 Repository
 * - JpaSpecificationExecutor를 상속받아 복잡한 동적 쿼리(검색, 필터링) 기능을 지원함
 */
public interface ProductRepository extends JpaRepository<ProductEntity, Long>, JpaSpecificationExecutor<ProductEntity> {

	// 판매 상태별 상품 개수 조회 (관리자 대시보드 통계용)
	// 예: countByStatus("SOLD_OUT") -> 품절 상품 수 반환
	long countByStatus(String status);

	// 상품 번호로 상세 조회
	ProductEntity findProductEntityByPrdNo(Long prdNo);
}
