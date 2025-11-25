package com.shoppingmallcoco.project.dto.comate;

import java.time.LocalDateTime;
import java.util.List;

import lombok.*;

@Getter
@Builder
public class MyReviewDTO {
	private Long reviewNo;

    private Long productNo;
    private String productName;
    private String productOption;
    
    private Integer rating;
    private String content;
    private LocalDateTime createdAt;
    private List<String> tags;
    private int likeCount;
}