package com.shoppingmallcoco.project.dto.comate;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.shoppingmallcoco.project.dto.review.ReviewImageDTO;

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
    private String productOption;
    private String productImg;
    
    private Long authorNo;
    private String authorNickname;
    
    private Integer rating;
    private String content;
    private List<String> tags;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDateTime createdAt;
    
    private List<ReviewImageDTO> reviewImages;
    
    private boolean likedByLoginUser;
    private int likeCount;
    
}
