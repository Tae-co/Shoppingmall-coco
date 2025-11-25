package com.shoppingmallcoco.project.dto.comate;

import java.time.LocalDateTime;
import java.util.List;

import lombok.*;

@Getter
@Setter
@Builder
public class LikedReviewDTO {
	private Long reviewNo;

    private Long productNo;
    private String productName;
    private String productOption;
    
    private Long authorNo;
    private String authorNickname;
    
    private Integer rating;
    private String content;
    private LocalDateTime createdAt;
    private List<String> tags;
    private int likeCount;
}
