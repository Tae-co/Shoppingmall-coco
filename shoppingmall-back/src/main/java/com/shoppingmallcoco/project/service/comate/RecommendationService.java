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
import com.shoppingmallcoco.project.entity.product.ProductImageEntity;
import com.shoppingmallcoco.project.entity.review.Review;
import com.shoppingmallcoco.project.repository.comate.FollowRepository;
import com.shoppingmallcoco.project.repository.mypage.SkinRepository;
import com.shoppingmallcoco.project.repository.order.OrderRepository;
import com.shoppingmallcoco.project.repository.product.ProductRepository;
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
    
    /* 추천 상품 */
    public List<RecommendPrdDTO> recommendProduct(Long loginUserNo) {
        if (skinRepository.findByMember_MemNo(loginUserNo).isEmpty()) {
            return fallbackProduct();
        }
        
        List<Member> followingUsers = followRepository.findFollowingInfo(loginUserNo)
                .stream()
                .map(dto -> new Member(dto.getMemNo(), dto.getNickname()))
                .collect(Collectors.toList());
        
        if (followingUsers.isEmpty()) return fallbackProduct();
        
        List<Member> highFollow = followingUsers.stream()
                .filter(u -> matchingService.getUserMatch(loginUserNo, u.getMemNo()) >= HIGH_MATCH)
                .collect(Collectors.toList());
        if (!highFollow.isEmpty()) return getProductsFromUsers(highFollow);

        List<Member> mediumFollow = followingUsers.stream()
                .filter(u -> {
                    int rate = matchingService.getUserMatch(loginUserNo, u.getMemNo());
                    return MEDIUM_MATCH <= rate && rate < HIGH_MATCH;
                })
                .collect(Collectors.toList());
        if (!mediumFollow.isEmpty()) return getProductsFromUsers(mediumFollow);
        
        return fallbackProduct();
    }
    
    /* 추천 상품 목록 생성 */
    private List<RecommendPrdDTO> getProductsFromUsers(List<Member> users) {
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
                .map(p -> RecommendPrdDTO.builder()
                        .productNo(p.getPrdNo())
                        .productName(p.getPrdName())
                        .productPrice(p.getPrdPrice())   // 기존 getPrice() -> getPrdPrice()
                        .productImg(getMainImageUrl(p))
                        .build())
                .collect(Collectors.toList());
    }
    
    /* 스킨 프로필 없는 유저 fallback */
    private List<RecommendPrdDTO> fallbackProduct() {
        List<ProductEntity> recent = productRepository.findRecentProducts(PageRequest.of(0, 5));
        return recent.stream()
                .map(p -> RecommendPrdDTO.builder()
                        .productNo(p.getPrdNo())
                        .productName(p.getPrdName())
                        .productPrice(p.getPrdPrice())
                        .productImg(getMainImageUrl(p))
                        .build())
                .collect(Collectors.toList());
    }
    
    /* 리뷰 추천 */
    private List<RecommendReviewDTO> recommendReview(Long loginUserNo) {
        List<Member> following = followRepository.findFollowingInfo(loginUserNo)
                .stream()
                .map(dto -> new Member(dto.getMemNo(), dto.getNickname()))
                .collect(Collectors.toList());
        
        List<Review> reviewPool = new ArrayList<>();
        for (Member f : following) {
            reviewRepository.findByOrderItem_Order_Member_MemNoOrderByCreatedAtDesc(f.getMemNo())
                .forEach(reviewPool::add);
        }
        
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
                .map(r -> RecommendReviewDTO.builder()
                        .reviewNo(r.getReviewNo())
                        .productNo(r.getOrderItem().getProduct().getPrdNo())
                        .productName(r.getOrderItem().getProduct().getPrdName())
                        .productImg(getMainImageUrl(r.getOrderItem().getProduct()))
                        .authorNo(r.getOrderItem().getOrder().getMember().getMemNo())
                        .authorNickname(r.getOrderItem().getOrder().getMember().getMemNickname())
                        .rating(r.getRating())
                        .content(r.getContent())
                        .createdAt(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
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
        
        return candidates.stream()
                .limit(RANDOM_LIMIT_4)
                .map(u -> new RecommendUserDTO(
                        u.getMemNo(),
                        u.getMemNickname(),
                        matchingService.getUserMatch(loginUserNo, u.getMemNo())))
                .collect(Collectors.toList());
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
