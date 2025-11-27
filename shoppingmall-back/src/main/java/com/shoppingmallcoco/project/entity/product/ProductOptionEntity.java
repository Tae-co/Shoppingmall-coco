package com.shoppingmallcoco.project.entity.product;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * 상품 옵션 정보를 담는 엔티티 (PRODUCTOPTION 테이블)
 * - 예: 용량(50ml, 100ml), 색상(Red, Blue) 등
 * - 각 옵션별로 재고(Stock)와 추가 금액(AddPrice)을 독립적으로 관리함
 */
@Entity
@Getter
@Setter
@Table(name = "PRODUCTOPTION")
public class ProductOptionEntity {

	@Id
	@Column(name = "OPTIONNO")
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "product_option_gen")
	@SequenceGenerator(name = "product_option_gen", sequenceName = "productOption_SEQ", allocationSize = 1)
	private Long optionNo;

	@Column(name = "OPTIONNAME")
	private String optionName; // 옵션 명 (예: 용량, 사이즈)

	@Column(name = "OPTIONVALUE")
	private String optionValue; // 옵션 값 (예: 50ml, L)

	/**
	 * 옵션별 재고 수량
	 * 주문 발생 시 이 필드의 값이 차감됨
	 * 0이 되면 품절 처리
	 */
	@Column(name = "STOCK")
	private int stock;

	// 기본 상품 가격에 더해지는 추가 금액 (0원이면 추가금 없음)
	@Column(name = "ADDPRICE")
	private int addPrice;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PRDNO", nullable = false)
	private ProductEntity product;

	/**
	 * 옵션 생성 편의 메소드 (정적 팩토리 메소드 패턴)
	 * 엔티티 생성과 값 설정을 한 번에 처리하여 가독성을 높임
	 */
	public static ProductOptionEntity create(ProductEntity product, String optionName, String optionValue, int addPrice,
			int stock) {
		ProductOptionEntity option = new ProductOptionEntity();
		option.setProduct(product);
		option.setOptionName(optionName);
		option.setOptionValue(optionValue);
		option.setAddPrice(addPrice);
		option.setStock(stock);
		return option;
	}


    // 재고 차감 (주문 시)
    public void removeStock(int quantity) {
        int restStock = this.stock - quantity;
        if (restStock < 0) {
            throw new RuntimeException("재고가 부족합니다. (현재 재고: " + this.stock + ")");
        }
        this.stock = restStock;
    }

    // 재고 복구 (주문 취소 시)
    public void addStock(int quantity) {
        this.stock += quantity;
    }
}
