package com.shoppingmallcoco.project.dto.product;

import com.shoppingmallcoco.project.entity.product.ProductOptionEntity;

import lombok.Data;

@Data
public class ProductOptionDTO {
    // API 명세서에 필요한 옵션 정보
    private Long optionNo;
    private String optionName;
    private String optionValue;
    private int stock;
    private int addPrice;

    // Entity -> DTO 변환 생성자
    public ProductOptionDTO(ProductOptionEntity option) {
        this.optionNo = option.getOptionNo();
        this.optionName = option.getOptionName();
        this.optionValue = option.getOptionValue();
        this.stock = option.getStock();
        this.addPrice = option.getAddPrice();
    }
}