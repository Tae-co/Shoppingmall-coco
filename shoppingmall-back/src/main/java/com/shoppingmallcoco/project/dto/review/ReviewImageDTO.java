package com.shoppingmallcoco.project.dto.review;

import com.shoppingmallcoco.project.entity.review.Review;
import com.shoppingmallcoco.project.entity.review.ReviewImage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewImageDTO {

    private long reviewImageNo; // 리뷰 이미지 번호
    private long reviewNo; // 리뷰 고유 번호
    private String imageUrl; // 리뷰 이미지

    public static ReviewImageDTO toDTO(ReviewImage entity) {
        return ReviewImageDTO.builder().reviewImageNo(entity.getReviewImageNo())
            .reviewNo(entity.getReview().getReviewNo()).imageUrl(
                entity.getImageUrl()).build();
    }

}
