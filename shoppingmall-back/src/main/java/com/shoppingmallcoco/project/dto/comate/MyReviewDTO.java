package com.shoppingmallcoco.project.dto.comate;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.*;

@Getter
@Builder
public class MyReviewDTO {
	private Long reviewNo;

    private Long productNo;
    private String productName;
    private String productOption;
    private String productImg;
    
    private Integer rating;
    private String content;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDateTime createdAt;
    
    private List<String> tags;
    
    private boolean likedByCurrentUser;
    private int likeCount;
}