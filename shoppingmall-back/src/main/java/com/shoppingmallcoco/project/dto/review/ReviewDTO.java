package com.shoppingmallcoco.project.dto.review;

import com.shoppingmallcoco.project.entity.review.Review;
import com.shoppingmallcoco.project.entity.review.ReviewTagMap;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {

    private Long reviewNo; // 리뷰 ID
    private Long orderItemNo; // 구매 내역
    private String userNickname;
    private Long memNo; // 리뷰 작성자 회원번호
    private int rating; // 별점
    private String content; // 리뷰 텍스트
    private LocalDateTime createdAt; // 리뷰 작성 날짜
    private LocalDateTime updatedAt; // 리뷰 수정 날짜
    private int likeCount; // 리뷰 좋아요 개수
    private List<Long> tagIds;
    private List<TagDTO> prosTags;
    private List<TagDTO> consTags;
    private List<ReviewImageDTO> reviewImages;

    // Entity -> Dto
    public static ReviewDTO toDto(Review entity, int likeCount) {
        List<TagDTO> prosTagList = null;
        List<TagDTO> consTagList = null;

        if (entity.getReviewTagMaps() != null && !entity.getReviewTagMaps().isEmpty()) {
            prosTagList = entity.getReviewTagMaps().stream()
                .map(ReviewTagMap::getTag)
                .filter(tag -> tag.getTagStatus().equals("장점"))
                .map(TagDTO::toDTO)
                .collect(Collectors.toList());

            consTagList = entity.getReviewTagMaps().stream()
                .map(ReviewTagMap::getTag)
                .filter(tag -> tag.getTagStatus().equals("단점"))
                .map(TagDTO::toDTO)
                .collect(Collectors.toList());
        }

        List<ReviewImageDTO> reviewImagesList = null;

        reviewImagesList = entity.getReviewImages().stream().map(ReviewImageDTO::toDTO)
            .collect(Collectors.toList());

        return ReviewDTO.builder().reviewNo(entity.getReviewNo())
            .orderItemNo(entity.getOrderItem().getOrderItemNo()).rating(entity.getRating()).content(
                entity.getContent()).createdAt(entity.getCreatedAt())
            .userNickname(entity.getOrderItem().getOrder().getMember().getMemNickname())
            .memNo(entity.getOrderItem().getOrder().getMember().getMemNo())
            .updatedAt(entity.getUpdatedAt()).likeCount(likeCount).prosTags(prosTagList)
            .consTags(consTagList).reviewImages(reviewImagesList).build();
    }
}
