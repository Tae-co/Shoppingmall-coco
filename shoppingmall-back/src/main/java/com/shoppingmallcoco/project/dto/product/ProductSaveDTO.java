package com.shoppingmallcoco.project.dto.product;

import lombok.Data;
import java.util.List;

@Data
public class ProductSaveDTO {
    private String prdName;
    private String description;
    private Long categoryNo;
    private int prdPrice;
    private String howToUse;
    private String status;
    
    // 태그 정보
    private String skinType;
    private String skinConcern;
    private String personalColor;

    // 옵션 리스트 추가
    private List<OptionDTO> options;

    @Data
    public static class OptionDTO {
        private Long optionNo; // 수정 시 필요 (신규 추가면 null)
        private String optionName;
        private String optionValue;
        private int addPrice;
        private int stock;
    }
}