package com.shoppingmallcoco.project.dto.product;

import java.util.List;
import java.util.stream.Collectors;

import com.shoppingmallcoco.project.dto.product.ProductOptionDTO;
import com.shoppingmallcoco.project.entity.product.ProductEntity;
import com.shoppingmallcoco.project.entity.product.ProductImageEntity;

import lombok.Data;

import java.util.Arrays;
import java.util.Collections;

@Data
public class ProductDetailResponseDTO {

	private Long prdNo;
    private String prdName;
    private int prdPrice;
    private String description;
    private String howToUse;
    private List<String> imageUrls;
    private double averageRating; 
    private int reviewCount;
    private Long categoryNo;
    private String status;
    
    // 옵션 목록
    private List<ProductOptionDTO> options;
    
    // 태그
    private List<String> skinTypes;
    private List<String> skinConcerns;
    private List<String> personalColors;
    
    // 생성자: Entity -> DTO 변환
    public ProductDetailResponseDTO(ProductEntity product, int reviewCount, double averageRating) {
    	this.prdNo = product.getPrdNo();
        this.prdName = product.getPrdName();
        this.prdPrice = product.getPrdPrice();
        this.description = product.getDescription();
        this.howToUse = product.getHowToUse();
        this.status = product.getStatus();
    	
    	// Entity의 List<ProductImageEntity>를 List<String> (URL 목록)으로 변환
        if (product.getImages() != null) {
            this.imageUrls = product.getImages().stream()
                                    .map(ProductImageEntity::getImageUrl) // (image -> image.getImageUrl())
                                    .collect(Collectors.toList());
        } else {
            this.imageUrls = Collections.emptyList();
        }
        
        // 리뷰 통계
        this.averageRating = averageRating; 
        this.reviewCount = reviewCount;
        
        // 상품 옵션 변환 로직
        if (product.getOptions() != null) {
            this.options = product.getOptions().stream()
                                    .map(ProductOptionDTO::new)
                                    .collect(Collectors.toList());
        } else {
            this.options = Collections.emptyList();
        }
        
        if (product.getCategory() != null) {
            this.categoryNo = product.getCategory().getCategoryNo();
        }
        
        if (product.getSkinType() != null && !product.getSkinType().isEmpty()) {
            this.skinTypes = Arrays.asList(product.getSkinType().split("\\s*,\\s*"));
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
