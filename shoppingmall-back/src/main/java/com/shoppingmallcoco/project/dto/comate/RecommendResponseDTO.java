package com.shoppingmallcoco.project.dto.comate;

import java.util.List;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecommendResponseDTO {

	private List<RecommendPrdDTO> products;
	private List<RecommendReviewDTO> reviews;
	private List<RecommendUserDTO> users;
	
}
