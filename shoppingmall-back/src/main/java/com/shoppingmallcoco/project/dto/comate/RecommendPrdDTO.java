package com.shoppingmallcoco.project.dto.comate;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RecommendPrdDTO {

	private Long prdNo;
	private String prdName;
	private String reason; // 추천이유 (팔로우 또는 매칭률)
	
}
