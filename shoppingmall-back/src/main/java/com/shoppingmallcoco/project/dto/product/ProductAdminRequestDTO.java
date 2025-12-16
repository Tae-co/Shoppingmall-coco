package com.shoppingmallcoco.project.dto.product;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Data
@NoArgsConstructor
@Setter
public class ProductAdminRequestDTO {
    
	private String prdName;
    private String description;
    private Long categoryNo; 
    private int prdPrice;
    private int stock;
    private String status;
    private String howToUse;
    private String skinType;
    private String skinConcern;
    private String personalColor;
    
    private List<OptionDTO> options; 

    @Data
    public static class OptionDTO {
        private String optionName;
        private String optionValue;
        private int addPrice;
        private int stock;
    }
    
}