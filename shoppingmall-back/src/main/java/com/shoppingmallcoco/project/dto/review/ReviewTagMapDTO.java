package com.shoppingmallcoco.project.dto.review;

import com.shoppingmallcoco.project.entity.review.Review;
import com.shoppingmallcoco.project.entity.review.ReviewTagMap;
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
public class ReviewTagMapDTO {

    private long reviewTagNo; // pk
    private long reviewNo; // 리뷰 고유 번호
    private long tagNo; // 태그 고유 번호

    public static ReviewTagMapDTO toDTO(ReviewTagMap entity) {
        return ReviewTagMapDTO.builder().reviewTagNo(entity.getReviewTagNo())
            .reviewNo(entity.getReview().getReviewNo()).tagNo(
                entity.getTag().getTagNo()).build();
    }
}
