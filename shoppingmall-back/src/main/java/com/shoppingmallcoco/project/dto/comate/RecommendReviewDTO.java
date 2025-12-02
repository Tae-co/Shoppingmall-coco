package com.shoppingmallcoco.project.dto.comate;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecommendReviewDTO {

	private Long reviewNo;

    private Long productNo;
    private String productName;
    
    private Long authorNo;
    private String authorNickname;
    
    private String reason;
    
}
