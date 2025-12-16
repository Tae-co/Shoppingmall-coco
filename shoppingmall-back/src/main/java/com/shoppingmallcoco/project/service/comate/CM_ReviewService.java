package com.shoppingmallcoco.project.service.comate;

import java.util.List;

import org.springframework.stereotype.Service;

import com.shoppingmallcoco.project.dto.comate.LikedReviewDTO;
import com.shoppingmallcoco.project.dto.comate.MyReviewDTO;
import com.shoppingmallcoco.project.dto.review.ReviewImageDTO;
import com.shoppingmallcoco.project.entity.review.Review;
import com.shoppingmallcoco.project.entity.review.ReviewLike;
import com.shoppingmallcoco.project.repository.product.ProductRepository;
import com.shoppingmallcoco.project.repository.review.LikeRepository;
import com.shoppingmallcoco.project.repository.review.ReviewRepository;

import lombok.*;

@Service
@RequiredArgsConstructor
public class CM_ReviewService {

    private final ReviewRepository reviewRepository;
    private final LikeRepository likeRepository;

    /* 
     * 사용자가 작성한 리뷰 목록
     * sort option: "latest" "highRating" "lowRating" 
     */
    public List<MyReviewDTO> getMyReviews(Long targetMemNo, Long currentMemNo, String sort) {
    	
    	List<Review> reviews;
    	
    	switch(sort) {
    	case "highRating":
    		reviews = reviewRepository.findByOrderItem_Order_Member_MemNoOrderByRatingDesc(targetMemNo);
    		break;
    	case "lowRating":
    		reviews = reviewRepository.findByOrderItem_Order_Member_MemNoOrderByRatingAsc(targetMemNo);
    		break;
    	case "latest":
    	default:
    		reviews = reviewRepository.findByOrderItem_Order_Member_MemNoOrderByCreatedAtDesc(targetMemNo);
    	}
    		
    	return reviews.stream().map(review -> {
        	var orderItem = review.getOrderItem();
        	var product = orderItem.getProduct();
        	var option = orderItem.getProductOption();
        
        	List<String> tags = review.getReviewTagMaps().stream()
        		.map(map -> map.getTag().getTagName())
        		.toList();
        		
        	int likeCount = likeRepository.countByReview_ReviewNo(review.getReviewNo());
        	boolean likedByCurrentUser = likeRepository.existsByMember_MemNoAndReview_ReviewNo(currentMemNo, review.getReviewNo());
        	
        	// 상품 사진 파일 가져오기
        	String productImg = null;
            if (product.getImages() != null && !product.getImages().isEmpty()) {
                productImg = product.getImages().get(0).getImageUrl();
            }
            
            List<ReviewImageDTO> reviewImages = mapReviewImages(review);
        	
        	return MyReviewDTO.builder()
        		.reviewNo(review.getReviewNo())
                .productNo(product.getPrdNo())
                .productName(product.getPrdName())
                .productOption(option != null ? option.getOptionName() : null)
                .productImg(productImg)
                .rating(review.getRating())
                .createdAt(review.getCreatedAt())
                .tags(tags)
                .reviewImages(reviewImages)
                .content(review.getContent())
                .likeCount(likeCount)
                .likedByCurrentUser(likedByCurrentUser)
                .build();
        })
        .toList();
    }

    /* 사용자가 좋아요 누른 리뷰 목록 */
    public List<LikedReviewDTO> getLikedReviews(Long targetMemNo, Long currentMemNo, String sort) {
    	
    	List<Review> reviews;
    	
    	switch(sort) {
    	case "highRating":
    		reviews = likeRepository.findByMember_MemNo(targetMemNo).stream()
    					.map(ReviewLike::getReview)
    					.sorted((a, b) -> Integer.compare(b.getRating(), a.getRating()))
    					.toList();
    		break;
    	case "lowRating":
    		reviews = likeRepository.findByMember_MemNo(targetMemNo).stream()
						.map(ReviewLike::getReview)
						.sorted((a, b) -> Integer.compare(a.getRating(), b.getRating()))
						.toList();
			break;
    	case "latest":
    	default:
    		reviews = likeRepository.findByMember_MemNo(targetMemNo).stream()
						.map(ReviewLike::getReview)
						.sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
						.toList();
			break;
    	}
    	
        return reviews.stream().map(review -> {
        			var orderItem = review.getOrderItem();
        			var product = orderItem.getProduct();
        			var option = orderItem.getProductOption();
        			
        			List<String> tags = review.getReviewTagMaps().stream()
        					.map(map -> map.getTag().getTagName())
        					.toList();
        			
        			int likeCount = likeRepository.countByReview_ReviewNo(review.getReviewNo());
        			var reviewMember = orderItem.getOrder().getMember();
        			boolean likedByCurrentUser = currentMemNo != null &&
        	        		likeRepository.existsByMember_MemNoAndReview_ReviewNo(currentMemNo, review.getReviewNo());
        	        
        			// 상품 사진 파일 가져오기
                	String productImg = null;
                    if (product.getImages() != null && !product.getImages().isEmpty()) {
                        productImg = product.getImages().get(0).getImageUrl();
                    }
                    
                    List<ReviewImageDTO> reviewImages = mapReviewImages(review);
        			
        			return LikedReviewDTO.builder()
        					.reviewNo(review.getReviewNo())
                            .productNo(product.getPrdNo())
                            .productName(product.getPrdName())
                            .productOption(option != null ? option.getOptionName() : null)
                            .productImg(productImg)
                            .rating(review.getRating())
                            .createdAt(review.getCreatedAt())
                            .tags(tags)
                            .reviewImages(reviewImages)
                            .content(review.getContent())
                            .likeCount(likeCount)
                            .likedByCurrentUser(likedByCurrentUser)
                            .authorNo(reviewMember.getMemNo())
                            .authorNickname(reviewMember.getMemNickname())
                            .build();
        		})
        		.toList();
    }
    
    /* 리뷰 이미지 불러오기 */
    private List<ReviewImageDTO> mapReviewImages(Review review) {
        if (review.getReviewImages() == null || review.getReviewImages().isEmpty()) {
            return List.of();
        }

        return review.getReviewImages().stream()
            .map(ReviewImageDTO::toDTO)
            .toList();
    }
}
