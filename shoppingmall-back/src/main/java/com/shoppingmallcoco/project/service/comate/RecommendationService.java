package com.shoppingmallcoco.project.service.comate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shoppingmallcoco.project.dto.comate.RecommendPrdDTO;
import com.shoppingmallcoco.project.dto.comate.RecommendResponseDTO;
import com.shoppingmallcoco.project.dto.comate.RecommendReviewDTO;
import com.shoppingmallcoco.project.dto.comate.RecommendUserDTO;
import com.shoppingmallcoco.project.entity.auth.Member;
import com.shoppingmallcoco.project.entity.product.ProductEntity;
import com.shoppingmallcoco.project.entity.product.ProductImageEntity;
import com.shoppingmallcoco.project.entity.review.Review;
import com.shoppingmallcoco.project.repository.auth.MemberRepository;
import com.shoppingmallcoco.project.repository.comate.FollowRepository;
import com.shoppingmallcoco.project.repository.mypage.SkinRepository;
import com.shoppingmallcoco.project.repository.order.OrderRepository;
import com.shoppingmallcoco.project.repository.product.ProductRepository;
import com.shoppingmallcoco.project.repository.review.LikeRepository;
import com.shoppingmallcoco.project.repository.review.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationService {
    
    private final FollowRepository followRepository;
    private final OrderRepository orderRepository;
    private final SkinRepository skinRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final LikeRepository likeRepository;
    private final MemberRepository memberRepository;
    
    private final MatchingService matchingService;
    
    private static final int HIGH_MATCH = 70;
    private static final int MEDIUM_MATCH = 40;
    private static final int RANDOM_PRODUCT = 8;
    private static final int RANDOM_REVIEW = 2;
    private static final int RANDOM_USER = 4;
    
    /* 통합 추천 API */
    public RecommendResponseDTO recommendAll(Long loginUserNo) {
        List<RecommendPrdDTO> products = recommendProduct(loginUserNo); 
        List<RecommendReviewDTO> reviews = recommendReview(loginUserNo); 
        List<RecommendUserDTO> users = recommendUser(loginUserNo); 
        
        return new RecommendResponseDTO(products, reviews, users);
    }
    
    /* 추천 상품 */
    public List<RecommendPrdDTO> recommendProduct(Long loginUserNo) {
    	
    	List<RecommendPrdDTO> result = new ArrayList<>();
    	
        if (skinRepository.findByMember_MemNo(loginUserNo).isEmpty()) {
            return fallbackProducts();
        }
        
        // 1 팔로우한 유저가 구매한 상품
        List<ProductEntity> followProducts = getProductsFromFollowing(loginUserNo);
        addProducts(result, followProducts);
        
        // 2 8개 미만인 경우-> 매칭률 높은 사용자가 구매한 상품 추가
        if (result.size() < RANDOM_PRODUCT) {
        	List<ProductEntity> matchedProducts = getProductsFromMatchedUsers(loginUserNo);
        	addProducts(result, matchedProducts);
        }
        
        // 3 그래도 부족한 경우-> 최근 등록 상품 추가
        if (result.size() < RANDOM_PRODUCT) {
        	List<ProductEntity> recent = productRepository.findRecentProducts(PageRequest.of(0, RANDOM_PRODUCT));
        	addProducts(result, recent);
        }
        
        return result.stream().limit(RANDOM_PRODUCT).collect(Collectors.toList());
    }
    
    /* 팔로우한 사람이 구매한 상품 */
    private List<ProductEntity> getProductsFromFollowing(Long loginUserNo) {
    	
    	List<Member> following = followRepository.findFollowingInfo(loginUserNo)
    			.stream()
    			.map(dto -> new Member(dto.getMemNo(), dto.getNickname()))
    			.collect(Collectors.toList());
    	
    	if (following.isEmpty())	return List.of();
    	
        Set<ProductEntity> set = new HashSet<>();
        for (Member user : following) {
            orderRepository.findAllByMemberMemNoOrderByOrderNoDesc(user.getMemNo())
                    .forEach(o -> o.getOrderItems()
                            .forEach(oi -> set.add(oi.getProduct())));
        }
        
        List<ProductEntity> list = new ArrayList<>(set);
        Collections.shuffle(list);
        return list;
    }
    
    /* 매칭률 높은 유저가 구매한 상품 */
    private List<ProductEntity> getProductsFromMatchedUsers(Long loginUserNo) {
    	
    	List<Member> allUsers = followRepository.findAllMembersExcluding(loginUserNo);
    	
    	List<Member> matched = allUsers.stream()
    			.filter(u -> matchingService.getUserMatch(loginUserNo, u.getMemNo()) >= HIGH_MATCH)
    			.collect(Collectors.toList());
    	
    	if (matched.isEmpty())	return List.of();
    	
    	Set<ProductEntity> set = new HashSet<>();
        for (Member user : matched) {
            orderRepository.findAllByMemberMemNoOrderByOrderNoDesc(user.getMemNo())
                    .forEach(o -> o.getOrderItems()
                            .forEach(oi -> set.add(oi.getProduct())));
        }

        List<ProductEntity> list = new ArrayList<>(set);
        Collections.shuffle(list);
        return list;
    }
    
    /* 최근 상품 fallback (8개 고정) */
    private List<RecommendPrdDTO> fallbackProducts() {
        List<ProductEntity> recent = productRepository.findRecentProducts(PageRequest.of(0, RANDOM_PRODUCT));

        return recent.stream()
                .map(p -> RecommendPrdDTO.builder()
                        .productNo(p.getPrdNo())
                        .productName(p.getPrdName())
                        .productPrice(p.getPrdPrice())
                        .productImg(getMainImageUrl(p))
                        .build())
                .collect(Collectors.toList());
    }
    
    /* 상품 리스트에 추가 */
    private void addProducts(List<RecommendPrdDTO> result, List<ProductEntity> products) {
        for (ProductEntity p : products) {
            if (result.size() >= RANDOM_PRODUCT) break;

            boolean exists = result.stream()
                    .anyMatch(dto -> dto.getProductNo().equals(p.getPrdNo()));

            if (!exists) {
                result.add(RecommendPrdDTO.builder()
                        .productNo(p.getPrdNo())
                        .productName(p.getPrdName())
                        .productPrice(p.getPrdPrice())
                        .productImg(getMainImageUrl(p))
                        .build());
            }
        }
    }
    
    /* 추천 리뷰 */
    private List<RecommendReviewDTO> recommendReview(Long loginUserNo) {
    	
    	List<RecommendReviewDTO> result = new ArrayList<>();
    	
    	// 1 팔로우한 사람의 리뷰
    	List<Review> followReviews = getReviewsFromFollowing(loginUserNo);
    	addReview(loginUserNo, result, followReviews);
    	
    	// 2 2개 미만인 경우-> 매칭률 높은 사용자 리뷰 추가
    	if (result.size() < RANDOM_REVIEW) {
    		List<Review> matchedReviews = getReviewsFromMatchedUsers(loginUserNo);
    		addReview(loginUserNo, result, matchedReviews);
    	}
    	
    	// 3 그래도 부족한 경우-> 최근 등록 리뷰
		if (result.size() < RANDOM_REVIEW) {
			List<Review> recentReviews = reviewRepository.findRecentReviews(PageRequest.of(0, 10));
		    addReview(loginUserNo, result, recentReviews);
    	}
		
		return result.stream().limit(RANDOM_REVIEW).collect(Collectors.toList());
    
    }
    
    /* 팔로우한 사람이 작성한 리뷰 */
    private List<Review> getReviewsFromFollowing(Long loginUserNo) {

        List<Member> following = followRepository.findFollowingInfo(loginUserNo)
                .stream()
                .map(dto -> new Member(dto.getMemNo(), dto.getNickname()))
                .collect(Collectors.toList());

        if (following.isEmpty()) return List.of();

        List<Review> list = new ArrayList<>();
        for (Member f : following) {
            reviewRepository.findByOrderItem_Order_Member_MemNoOrderByCreatedAtDesc(f.getMemNo())
                    .forEach(list::add);
        }

        Collections.shuffle(list);
        return list;
    }

    /* 매칭률 높은 유저가 작성한 리뷰 */
    private List<Review> getReviewsFromMatchedUsers(Long loginUserNo) {

        List<Member> allUsers = followRepository.findAllMembersExcluding(loginUserNo);

        List<Member> matched = allUsers.stream()
                .filter(u -> matchingService.getUserMatch(loginUserNo, u.getMemNo()) >= HIGH_MATCH)
                .collect(Collectors.toList());

        if (matched.isEmpty()) return List.of();

        List<Review> list = new ArrayList<>();
        for (Member u : matched) {
            reviewRepository.findByOrderItem_Order_Member_MemNoOrderByCreatedAtDesc(u.getMemNo())
                    .forEach(list::add);
        }

        Collections.shuffle(list);
        return list;
    }
    
    /* 리뷰 리스트에 추가 */
    private void addReview(Long loginUserNo, List<RecommendReviewDTO> result, List<Review> reviews) {
        for (Review r : reviews) {
            if (result.size() >= RANDOM_REVIEW) break;

            boolean exists = result.stream()
                    .anyMatch(dto -> dto.getReviewNo().equals(r.getReviewNo()));
            
            List<String> tags = r.getReviewTagMaps().stream()
					.map(map -> map.getTag().getTagName())
					.toList();

            int likeCount = likeRepository.countByReview_ReviewNo(r.getReviewNo());
            boolean likedByLoginUser = likeRepository.existsByMember_MemNoAndReview_ReviewNo(loginUserNo, r.getReviewNo());
        
            if (!exists) {
                result.add(RecommendReviewDTO.builder()
                        .reviewNo(r.getReviewNo())
                        .productNo(r.getOrderItem().getProduct().getPrdNo())
                        .productName(r.getOrderItem().getProduct().getPrdName())
                        .productImg(getMainImageUrl(r.getOrderItem().getProduct()))
                        .authorNo(r.getOrderItem().getOrder().getMember().getMemNo())
                        .authorNickname(r.getOrderItem().getOrder().getMember().getMemNickname())
                        .rating(r.getRating())
                        .tags(tags)
                        .likedByLoginUser(likedByLoginUser)
                        .likeCount(likeCount)
                        .content(r.getContent())
                        .createdAt(r.getCreatedAt())
                        .build()
                );
            }
        }
    }

    
    /* 팔로우하지 않은 유저 추천 */
    private List<RecommendUserDTO> recommendUser(Long loginUserNo) {
        List<Member> nonFollowedUsers = followRepository.findNonFollowedMemNo(loginUserNo);
        
        List<Member> highMatch = nonFollowedUsers.stream()
                .filter(u -> matchingService.getUserMatch(loginUserNo, u.getMemNo()) >= HIGH_MATCH)
                .collect(Collectors.toList());
        
        List<Member> mediumMatch = nonFollowedUsers.stream()
                .filter(u -> {
                    int rate = matchingService.getUserMatch(loginUserNo, u.getMemNo());
                    return MEDIUM_MATCH <= rate && rate < HIGH_MATCH;
                })
                .collect(Collectors.toList());
        
        List<Member> candidates = new ArrayList<>();
        candidates.addAll(highMatch);
        candidates.addAll(mediumMatch);
        Collections.shuffle(candidates);
        
        if (candidates.size() < RANDOM_USER)	return fallbackUsers();
        
        return candidates.stream()
                .limit(RANDOM_USER)
                .map(u -> new RecommendUserDTO(
                        u.getMemNo(),
                        u.getMemNickname(),
                        matchingService.getUserMatch(loginUserNo, u.getMemNo())))
                .collect(Collectors.toList());
    }
    
    /* 유저 추천 fallback */
    private List<RecommendUserDTO> fallbackUsers() {
    	
    	// 1 리뷰 작성 개수가 많은 유저
    	List<Member> reviewRank = memberRepository.findUsersOrderByReviewCount(PageRequest.of(0, 5));
    	// 2 팔로워 많은 유저
    	List<Member> followerRank = followRepository.findUsersOrderByFollowerCount(PageRequest.of(0, 5));
    	// 3 최근 가입 유저
    	List<Member> recentJoin = memberRepository.findRecentUsers(PageRequest.of(0,  5));
    	
    	LinkedHashSet<Member> merged = new LinkedHashSet<>();
    	merged.addAll(reviewRank);
    	merged.addAll(followerRank);
    	merged.addAll(recentJoin);
    	
    	return merged.stream()
    			.limit(RANDOM_USER)
    			.map(member -> new RecommendUserDTO(
    					member.getMemNo(),
    					member.getMemNickname(),
    					null
    			))
    			.toList();
    }
    
    /* 상품 썸네일 가져오기 */
    private String getMainImageUrl(ProductEntity product) {
        if (product.getImages() == null || product.getImages().isEmpty()) return null;
        
        String mainImg = product.getImages().stream()
                .filter(img -> img.getSortOrder() != null && img.getSortOrder() == 1)
                .map(ProductImageEntity::getImageUrl)
                .findFirst()
                .orElse(null);
        
        if (mainImg != null) return mainImg;
        return product.getImages().get(0).getImageUrl();
    }
}
