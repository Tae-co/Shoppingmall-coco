package com.shoppingmallcoco.project.dto.comate;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecommendUserDTO {

	private Long memNo;
	private String nickname;
	private Integer matchingRate;
	
}
