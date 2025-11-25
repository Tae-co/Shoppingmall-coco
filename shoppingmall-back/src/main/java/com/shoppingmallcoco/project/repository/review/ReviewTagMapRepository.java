package com.shoppingmallcoco.project.repository.review;

import com.shoppingmallcoco.project.entity.review.Review;
import com.shoppingmallcoco.project.entity.review.ReviewTagMap;
import com.shoppingmallcoco.project.entity.review.Tag;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewTagMapRepository extends JpaRepository<ReviewTagMap, Long> {

    List<ReviewTagMap> findByReview(Review review);

    // 1. 특정 상품(prdNo)에 대해, 특정 피부타입(skinType)을 가진 사람들이 쓴 '총 리뷰 수' 구하기
    // (백분율 계산의 분모가 됩니다)
    @Query("SELECT COUNT(DISTINCT r) FROM Review r " +
        "JOIN r.orderItem oi " +
        "JOIN oi.order o " +
        "JOIN o.member m " +
        "JOIN m.skin s " + // Member와 Skin이 연결되어 있다고 가정
        "WHERE oi.product.prdNo = :prdNo AND s.skinType = :skinType")
    long countReviewsByProductAndSkinType(@Param("prdNo") Long prdNo,
        @Param("skinType") String skinType);

    // 2. 특정 상품(prdNo) + 특정 피부타입(skinType)인 리뷰들의 '태그별 개수' 구하기 (상위 3개만)
    // (ReviewTagMap -> Review -> ... -> Skin 경로)
    @Query("SELECT t.tagName AS tagName, COUNT(rtm) AS count, t.tagStatus AS tagStatus " +
        "FROM ReviewTagMap rtm " +
        "JOIN rtm.tag t " +
        "JOIN rtm.review r " +
        "JOIN r.orderItem oi " +
        "JOIN oi.order o " +
        "JOIN o.member m " +
        "JOIN m.skin s " +
        "WHERE oi.product.prdNo = :prdNo AND s.skinType = :skinType " +
        "GROUP BY t.tagName, t.tagStatus " +
        "ORDER BY COUNT(rtm) DESC")
    List<TagStatSimple> findTopTagsByProductAndSkinType(@Param("prdNo") Long prdNo,
        @Param("skinType") String skinType, Pageable pageable);

    // (DTO Projection을 위한 인터페이스)
    public interface TagStatSimple {

        String getTagName();

        Long getCount();

        String getTagStatus();
    }
}
