package com.shoppingmallcoco.project.dto.review;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SimilarSkinStatsDTO {

    private String skinType; // 피부 타입
    private Long totalReviewerCount; // 그 피부 타입을 가진 리뷰어 총 인원 수
    private List<TagStat> topTags; // 상위 태그 목록
    private String tagStatus;

    @Getter
    @AllArgsConstructor
    public static class TagStat {

        private String tagName; // 태그 이름
        private int percentage; // 사용 비율
        private long count; // 실제 선택 횟수
        private String tagStatus; // 태그 상태
    }

}
