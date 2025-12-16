package com.shoppingmallcoco.project.repository.review;

import com.shoppingmallcoco.project.entity.review.Review;
import com.shoppingmallcoco.project.entity.review.ReviewLike;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<ReviewLike,Long> {
    int countByReview(Review review);
    boolean existsByReviewAndMember_MemNo(Review review, Long memNo);
    
    // CO-MATE 기능 구현
    // 리뷰에 달린 좋아요 개수
    int countByReview_ReviewNo(Long reviewNo);
    // 특정 회원이 좋아요 누른 리뷰 개수
    int countByMember_MemNo(Long memNo);
    // 특정 회원이 좋아요 누른 모든 리뷰 조회
    List<ReviewLike> findByMember_MemNo(Long memNo);
    // 특정 회원이 특정 리뷰에 좋아요 눌렀는지 확인
    boolean existsByMember_MemNoAndReview_ReviewNo(Long memNo, Long reviewNo);

}
