package com.shoppingmallcoco.project.entity.product;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * 상품 이미지 정보를 담는 엔티티 (PRODUCTIMAGE 테이블)
 * - 하나의 상품(Product)은 여러 개의 이미지를 가질 수 있음 (1:N)
 * - 이미지의 저장 경로(URL)와 노출 순서(SortOrder)를 관리함
 */
@Entity
@Getter
@Setter
@Table(name = "PRODUCTIMAGE")
public class ProductImageEntity {

	@Id
	@Column(name = "PRODUCTIMAGENO")
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "product_image_gen")
	@SequenceGenerator(name = "product_image_gen", sequenceName = "productImage_SEQ", allocationSize = 1)
	private Long productImageNo;

	// 이미지 파일의 웹 접근 경로 (예: /images/uploads/uuid_filename.jpg)
	@Column(name = "IMAGEURL")
	private String imageUrl;

	/**
	 * 이미지 정렬 순서
	 * - 1번: 대표 이미지(썸네일)
	 * - 2번 ~ : 상세 페이지 내 추가 이미지
	 */
	@Column(name = "SORTORDER")
	private Integer sortOrder;

	// (양방향 연관관계 - 이 이미지가 속한 상품)
	// FetchType.LAZY: 이미지가 필요할 때만 조회하여 성능 최적화
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PRDNO", nullable = false)
	private ProductEntity product;

}
