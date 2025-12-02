package com.shoppingmallcoco.project.service.comate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
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
import com.shoppingmallcoco.project.entity.review.Review;
import com.shoppingmallcoco.project.repository.comate.FollowRepository;
import com.shoppingmallcoco.project.repository.mypage.SkinRepository;
import com.shoppingmallcoco.project.repository.order.OrderRepository;
import com.shoppingmallcoco.project.repository.product.ProductRepository;
import com.shoppingmallcoco.project.repository.review.ReviewRepository;

import lombok.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationService {
	
	private final FollowRepository followRepository;
	private final OrderRepository orderRepository;
	private final SkinRepository skinRepository;
	private final ProductRepository productRepository;
	private final ReviewRepository reviewRepository;
	
	private final MatchingService matchingService;
	
	private static final int HIGH_MATCH = 70;
	private static final int MEDIUM_MATCH = 40;
	private static final int RANDOM_LIMIT_2 = 2;
	private static final int RANDOM_LIMIT_4 = 4;
	
	/* 통합 추천 API */
	public RecommendResponseDTO recommendAll(Long loginUserNo) {
		List<RecommendPrdDTO> products = recommendProduct(loginUserNo); 
		List<RecommendReviewDTO> reviews = recommendReview(loginUserNo); 
		List<RecommendUserDTO> users = recommendUser(loginUserNo); 
		
		return new RecommendResponseDTO(products, reviews, users);
	}
	
	/* 상품 추천 */
	public List<RecommendPrdDTO> recommendProduct(Long loginUserNo) {
		// 스킨 프로필을 등록 여부 확인
		// 스킨 프로필이 없는 경우 최근 등록상품 추천
		if (skinRepository.findByMember_MemNo(loginUserNo).isEmpty()) {
			return fallbackProduct();
		}
		
		// 팔로우 사용자 조회
		List<Member> followingUsers = followRepository.findFollowingInfo(loginUserNo)
				.stream()
				.map(dto -> new Member(dto.getMemNo(), dto.getNickname()))
				.collect(Collectors.toList());
		
		if (followingUsers.isEmpty()) {
			return fallbackProduct();
		}
		
		// HIGH 매칭 && 팔로우 사용자
		List<Member> highFollow = followingUsers.stream()
				.filter(u -> matchingService.getUserMatch(loginUserNo, u.getMemNo()) >= HIGH_MATCH)
				.collect(Collectors.toList());
		if (!highFollow.isEmpty()) return getProductsFromUsers(highFollow, "HIGH_MATCH_FOLLOW");

		// MEDIUM 매칭 && 팔로우 사용자
		List<Member> mediumFollow = followingUsers.stream()
				.filter(u -> {
					int rate = matchingService.getUserMatch(loginUserNo, u.getMemNo());
					return MEDIUM_MATCH <= rate && rate < HIGH_MATCH;
				})
				.collect(Collectors.toList());
		if (!mediumFollow.isEmpty()) return getProductsFromUsers(mediumFollow, "MEDIUM_MATCH_FOLLOW");
		
		// fallback-> 프로필 등록 유도 및 최근 등록상품 추천
		return fallbackProduct();
	}
	
	/* 추천 상품 목록 생성 */
	private List<RecommendPrdDTO> getProductsFromUsers(List<Member> users, String reason) {
		Set<ProductEntity> productSet = new HashSet<>();
		
		for (Member u : users) {
			orderRepository.findAllByMemberMemNoOrderByOrderNoDesc(u.getMemNo())
					.forEach(o -> o.getOrderItems()
							.forEach(oi -> productSet.add(oi.getProduct())));
		}
		
		List<ProductEntity> shuffled = new ArrayList<>(productSet);
		Collections.shuffle(shuffled);
		return shuffled.stream()
				.limit(RANDOM_LIMIT_4)
				.map(p -> new RecommendPrdDTO(p.getPrdNo(), p.getPrdName(), reason))
				.collect(Collectors.toList());
	}
	
	/* 스킨 프로필 등록하지 않은 유저 */
	private List<RecommendPrdDTO> fallbackProduct() {
		List<ProductEntity> recent = productRepository.findRecentProducts(PageRequest.of(0,  5));
		return recent.stream()
				.map(p -> new RecommendPrdDTO(p.getPrdNo(), p.getPrdName(), "PROFILE_REQUIRED"))
				.collect(Collectors.toList());
	}
	
	/* 리뷰 추천 */
	private List<RecommendReviewDTO> recommendReview(Long loginUserNo) {
		List<Member> following = followRepository.findFollowingInfo(loginUserNo)
				.stream()
				.map(dto -> new Member(dto.getMemNo(), dto.getNickname()))
				.collect(Collectors.toList());
		
		List<Review> reviewPool = new ArrayList<>();
		
		// 팔로우 사용자 리뷰
		for (Member f : following) {
			reviewRepository.findByOrderItem_Order_Member_MemNoOrderByCreatedAtDesc(f.getMemNo())
				.forEach(reviewPool::add);
		}
		
		// 팔로우 하지 않는 && 매칭률 높은 사용자 리뷰
		// 팔로우하지 않은 사용자 조회
		List<Member> allUsers = followRepository.findAllMembersExcluding(loginUserNo);
		List<Member> highMatchUsers = allUsers.stream()
				.filter(u -> matchingService.getUserMatch(loginUserNo, u.getMemNo()) >= HIGH_MATCH)
				.collect(Collectors.toList());
		
		for (Member u : highMatchUsers) {
			reviewRepository.findByOrderItem_Order_Member_MemNoOrderByCreatedAtDesc(u.getMemNo())
				.forEach(reviewPool::add);
		}
		
		List<Review> shuffled = new ArrayList<>(reviewPool);
		Collections.shuffle(shuffled);
		
		return shuffled.stream()
				.limit(RANDOM_LIMIT_2)
				.map(r -> new RecommendReviewDTO(
						r.getReviewNo(),
						r.getOrderItem().getProduct().getPrdNo(),
						r.getOrderItem().getProduct().getPrdName(),
						r.getOrderItem().getOrder().getMember().getMemNo(),
						r.getOrderItem().getOrder().getMember().getMemNickname(),
						"FOLLOW_OR_HIGH_MATCH_REVIEW"
				))
				.collect(Collectors.toList());	
	}
	
	/* 팔로우 유저 추천 */
	private List<RecommendUserDTO> recommendUser(Long loginUserNo) {
		List<Member> allUsers = followRepository.findAllMembersExcluding(loginUserNo);
		
		List<Member> highMatch = allUsers.stream()
				.filter(u -> matchingService.getUserMatch(loginUserNo, u.getMemNo()) >= HIGH_MATCH)
				.collect(Collectors.toList());
		
		List<Member> mediumMatch = allUsers.stream()
				.filter(u -> {
					int rate = matchingService.getUserMatch(loginUserNo, u.getMemNo());
					return MEDIUM_MATCH <= rate && rate < HIGH_MATCH;
				})
				.collect(Collectors.toList());
		
		List<Member> candidates = new ArrayList<>();
		candidates.addAll(highMatch);
		candidates.addAll(mediumMatch);
		Collections.shuffle(candidates);
		
		return candidates.stream()
				.limit(RANDOM_LIMIT_4)
				.map(u -> new RecommendUserDTO(u.getMemNo(), u.getMemNickname()))
				.collect(Collectors.toList());
	}
}
