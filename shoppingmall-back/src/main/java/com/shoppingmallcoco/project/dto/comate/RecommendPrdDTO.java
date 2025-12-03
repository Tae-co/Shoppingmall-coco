package com.shoppingmallcoco.project.dto.comate;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecommendPrdDTO {

	private Long productNo;
	private String productName;
	private int productPrice;
	private String productImg;
	
}
