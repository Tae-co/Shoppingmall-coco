package com.shoppingmallcoco.project.repository.review;

import com.shoppingmallcoco.project.dto.review.ReviewDTO;
import com.shoppingmallcoco.project.entity.review.Review;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.PathVariable;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // review 등록, // review 수정한 내용 Update
    //Review save(Review review);

    // review 1개 조회 (수정하기 위해서)
    //Optional<Review> findById(Long reviewNo);

    // review 모든 목록 조회 (하나의 상품에 등록된 리뷰 목록 조회)
    List<Review> findByOrderItemProductPrdNo(Long prdNo);

    // reviewNo 조회 작성 확인
    // 이미 리뷰 작성하면 리뷰 작성 못하게 -> reviewNo 조회 하고 -> orderItemNo 조회 -> memNo 조회 해서 리뷰 작성 되어 있는지 확인
    @Query("SELECT r.reviewNo FROM Review r "
        + "JOIN r.orderItem oi "
        + "JOIN oi.order o "
        + "JOIN o.member m "
        + "WHERE oi.product.prdNo = :prdNo AND m.memNo = :memNo"
    )
    Long findReviewsNoByOrderItemMemberAndPrdNo(@Param("prdNo")Long prdNo, @Param("memNo") Long memNo);

    // 회원 넘버 조회
    @Query("SELECT m.memNo FROM Review r "
        + "JOIN r.orderItem oi "
        + "JOIN oi.order o "
        + "JOIN o.member m "
        + "WHERE r.reviewNo = :reviewNo ")
    Long getMemberNoByReviewNoAndOrderItemOrderNo(@Param("reviewNo") Long reviewNo);

    // review 삭제
    //void deleteById(Long reviewNo);

    // Co-Mate 순
    @Query("SELECT r FROM Review r " +
        "JOIN r.orderItem oi " +
        "JOIN oi.order o " +
        "JOIN o.member m " +
        "JOIN m.skin s " +
        "WHERE oi.product.prdNo = :prdNo " +
        "AND s.skinType = :skinType ")
    Page<Review> findPageByProductAndSkinType(@Param("prdNo") Long prdNo,
        @Param("skinType") String skinType, Pageable pageable);

    Page<Review> findByOrderItemProductPrdNo(Long prdNo, Pageable pageable);
    
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
