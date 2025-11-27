package com.shoppingmallcoco.project.entity.product;

import java.time.LocalDate;
import java.util.List;

import org.hibernate.annotations.ColumnDefault;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * 상품 정보를 담는 엔티티 클래스 (PRODUCT 테이블 매핑)
 * - 상품의 기본 정보, 카테고리, 옵션, 이미지와의 연관관계를 관리함
 */
@Entity
@Getter
@Setter
@Table(name = "PRODUCT")
public class ProductEntity {

	@Id
	@Column(name = "PRDNO")
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "product_seq_generator")
	@SequenceGenerator(name = "product_seq_generator", sequenceName = "PRODUCT_SEQ", allocationSize = 1)
	private Long prdNo;

	@Column(name = "PRDNAME")
	private String prdName;

	@Column(name = "PRDPRICE")
	private int prdPrice;

	@Lob
	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "HOWTOUSE")
	private String howToUse;

	@Column(name = "REG_DATE")
	private LocalDate regDate;

	@Column(name = "SKINTYPE")
	private String skinType;

	@Column(name = "SKINCONCERN")
	private String skinConcern;

	@Column(name = "PERSONALCOLOR")
	private String personalColor;

	@Column(name = "STATUS")
	private String status;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CATEGORY_NO", nullable = false)
	private CategoryEntity category;

	@OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ProductOptionEntity> options;

	@OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("sortOrder ASC") // 이미지 순서(sortOrder)대로 정렬 1번이 썸네일
	private List<ProductImageEntity> images;

	// 논리적 삭제 여부 (Y: 삭제됨, N: 정상)
	@Column(name = "IS_DELETED", length = 1)
	private String isDeleted = "N";

	/**
	 * 상품 삭제 처리를 위한 메소드
	 * - isDeleted 상태를 'Y'로 변경하여 논리적으로 삭제함
	 */
	public void delete() {
		this.isDeleted = "Y";
	}

	// 판매량 (인기순 정렬용)
	@Column(name = "SALES_COUNT")
	@ColumnDefault("0") // 기본값 0
	private long salesCount;

	/**
	 * 판매량 증가 메소드
	 * - 주문 완료 시 호출되어 해당 상품의 인기 지수(판매량)를 높임
	 */
	public void addSalesCount(int count) {
		this.salesCount += count;
	}

	/**
	 * 판매량 감소 메소드
	 * - 주문 취소/반품 시 호출됨
	 * - 0 미만으로 떨어지지 않도록 방어 로직 포함
	 */
	public void removeSalesCount(int count) {
		this.salesCount -= count;
		if (this.salesCount < 0)
			this.salesCount = 0;
	}

}
