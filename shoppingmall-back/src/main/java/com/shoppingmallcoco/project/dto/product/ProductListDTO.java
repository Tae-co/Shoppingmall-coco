package com.shoppingmallcoco.project.dto.product;

import java.util.List;
import java.util.Arrays;
import java.util.Collections;
import com.shoppingmallcoco.project.entity.product.ProductEntity;
import com.shoppingmallcoco.project.entity.product.ProductOptionEntity;

import lombok.Data;

@Data
public class ProductListDTO {
	private Long prdNo;
	private String prdName;
	private int prdPrice;
	private String imageUrl;
	private double averageRating;
	private int reviewCount;
	private String categoryName;
    private int stock; 
    private String status;
	private List<String> skinTypes;
	private List<String> skinConcerns;
	private List<String> personalColors;
	private String simpleReview;
	private Long defaultOptionNo;
	
	// Entity -> DTO 변환 생성자
	public ProductListDTO(ProductEntity product, int reviewCount, double averageRating) {
		this.prdNo = product.getPrdNo();
		this.prdName = product.getPrdName();
		this.prdPrice = product.getPrdPrice();
		this.status = product.getStatus();
		
		// 카테고리 이름 매핑
        if (product.getCategory() != null) {
            this.categoryName = product.getCategory().getCategoryName();
        }
        
        // 재고(Stock) 계산
        if (product.getOptions() != null && !product.getOptions().isEmpty()) {
            this.stock = product.getOptions().stream()
                                .mapToInt(ProductOptionEntity::getStock)
                                .sum();
        } else {
            this.stock = 0;
        }
        
        // 상태(Status) 매핑
        String dbStatus = product.getStatus();
        
        if ("SOLD_OUT".equals(dbStatus)) {
            this.status = "품절";
        } else if ("STOP".equals(dbStatus)) {
            this.status = "판매중지"; // [추가] 판매중지 처리
        } else {
            this.status = "판매중";
        }
		
		if (product.getImages() != null && !product.getImages().isEmpty()) {
            this.imageUrl = product.getImages().get(0).getImageUrl();
        } else {
            this.imageUrl = null; // 이미지가 없으면 null
        }
		
		// 리뷰 통계
		this.averageRating = averageRating;
        this.reviewCount = reviewCount;
        
        // 임시 로직
        this.simpleReview = "DB 리뷰 요약... (구현 필요)";
        
        // 상품의 첫 번째 옵션 번호를 가져옴
        if (product.getOptions() != null && !product.getOptions().isEmpty()) {
            this.defaultOptionNo = product.getOptions().get(0).getOptionNo();
        }

        // 쉼표로 구분된 문자열을 List<String>으로 변환
        if (product.getSkinType() != null && !product.getSkinType().isEmpty()) {
            this.skinTypes = Arrays.asList(product.getSkinType().split("\\s*,\\s*")); // (쉼표와 공백으로 분리)
        } else {
            this.skinTypes = Collections.emptyList();
        }
        
        if (product.getSkinConcern() != null && !product.getSkinConcern().isEmpty()) {
            this.skinConcerns = Arrays.asList(product.getSkinConcern().split("\\s*,\\s*"));
        } else {
            this.skinConcerns = Collections.emptyList();
        }
        
        if (product.getPersonalColor() != null && !product.getPersonalColor().isEmpty()) {
            this.personalColors = Arrays.asList(product.getPersonalColor().split("\\s*,\\s*"));
        } else {
            this.personalColors = Collections.emptyList();
        }
	}
}
