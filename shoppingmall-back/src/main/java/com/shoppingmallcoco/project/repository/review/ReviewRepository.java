package com.shoppingmallcoco.project.repository.review;

import com.shoppingmallcoco.project.entity.review.Review;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // review 등록, // review 수정한 내용 Update
    //Review save(Review review);

    // review 1개 조회 (수정하기 위해서)
    //Optional<Review> findById(Long reviewNo);

    // review 모든 목록 조회 (하나의 상품에 등록된 리뷰 목록 조회)
    List<Review> findByOrderItemProductPrdNo(Long prdNo);

    //
    @Query("SELECT m.memNo FROM Review r "
        + "JOIN r.orderItem oi "
        + "JOIN oi.order o "
        + "JOIN o.member m "
        + "WHERE r.reviewNo = :reviewNo ")
    Long getMemberNoByReviewNoAndOrderItemOrderNo(@Param("reviewNo") Long reviewNo);

    // review 삭제
    //void deleteById(Long reviewNo);
    
	/* CO-MATE 기능 구현 */
    /* 특정 사용자가 작성한 리뷰 개수 */
 	int countByOrderItem_Order_Member_MemNo(Long memNo);
    
 	/* 특정 사용자가 작성한 리뷰 조회 */
 	// 최신순
	List<Review> findByOrderItem_Order_Member_MemNoOrderByCreatedAtDesc(Long memNo);
	// 별점 높은순
	List<Review> findByOrderItem_Order_Member_MemNoOrderByRatingDesc(Long memNo);
	// 별점 낮은순
	List<Review> findByOrderItem_Order_Member_MemNoOrderByRatingAsc(Long memNo);

}
