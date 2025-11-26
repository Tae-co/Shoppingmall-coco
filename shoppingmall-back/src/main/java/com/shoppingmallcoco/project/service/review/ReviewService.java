package com.shoppingmallcoco.project.service.review;

import com.shoppingmallcoco.project.dto.review.ReviewDTO;
import com.shoppingmallcoco.project.dto.review.SimilarSkinStatsDTO;
import com.shoppingmallcoco.project.entity.auth.Member;
import com.shoppingmallcoco.project.entity.mypage.SkinProfile;
import com.shoppingmallcoco.project.entity.order.OrderItem;
import com.shoppingmallcoco.project.entity.product.ProductEntity;
import com.shoppingmallcoco.project.entity.review.Review;
import com.shoppingmallcoco.project.entity.review.ReviewImage;
import com.shoppingmallcoco.project.entity.review.ReviewLike;
import com.shoppingmallcoco.project.entity.review.ReviewTagMap;
import com.shoppingmallcoco.project.entity.review.Tag;
import com.shoppingmallcoco.project.repository.auth.MemberRepository;
import com.shoppingmallcoco.project.repository.mypage.SkinRepository;
import com.shoppingmallcoco.project.repository.order.OrderItemRepository;
import com.shoppingmallcoco.project.repository.order.OrderRepository;
import com.shoppingmallcoco.project.repository.product.ProductRepository;
import com.shoppingmallcoco.project.repository.review.LikeRepository;
import com.shoppingmallcoco.project.repository.review.ReviewImageRepository;
import com.shoppingmallcoco.project.repository.review.ReviewRepository;
import com.shoppingmallcoco.project.repository.review.ReviewTagMapRepository;
import com.shoppingmallcoco.project.repository.review.TagRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ReviewService implements IReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final LikeRepository likeRepository;
    private final ReviewImageRepository reviewImageRepository;
    private final ReviewTagMapRepository reviewTagMapRepository;
    private final TagRepository tagRepository;
    private final FileUploadService fileUploadService;
    private final SkinRepository skinRepository;
    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;

    // review 등록
    @Transactional
    public Long insertReview(ReviewDTO reviewDTO, List<MultipartFile> files, Long memberNo) {

        // 구매 내역 확인
        OrderItem orderItem = orderItemRepository.findById(reviewDTO.getOrderItemNo())
            .orElseThrow(() -> new IllegalArgumentException("구매내역이 없습니다."));

        // Entity로 변경
        Review review = Review.toEntity(orderItem, reviewDTO);

        // 주문한 사용자와 로그인한 사용자가 일치하는지 확인
        if (orderItem.getOrder() == null || orderItem.getOrder().getMember() == null) {
            throw new IllegalArgumentException("주문 정보가 올바르지 않습니다.");
        }

        Long orderMemberNo = orderItem.getOrder().getMember().getMemNo();
        if (!orderMemberNo.equals(memberNo)) {
            throw new IllegalArgumentException("본인의 주문 내역에만 리뷰를 작성할 수 있습니다.");
        }

        // 리뷰 저장
        reviewRepository.save(review);

        // 이미지 파일 여부
        // 업로드한 파일 MultipartFile 객체에 하나씩 담기, 파일 upload, entity로 변환, 리뷰이미지에 save
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                String imageUrl = fileUploadService.upload(file);

                ReviewImage reviewImage = ReviewImage.toEntity(imageUrl, review);

                reviewImageRepository.save(reviewImage);
            }
        }

        // 태그 아이디 여부, ReviewTagMap타입으로 엔티티 변환, 저장
        if (reviewDTO.getTagIds() != null && !reviewDTO.getTagIds().isEmpty()) {
            for (Long tagId : reviewDTO.getTagIds()) {
                Tag tag = tagRepository.findById(tagId)
                    .orElseThrow(() -> new IllegalArgumentException("일치하는 태그가 없습니다."));
                ReviewTagMap reviewTagMap = ReviewTagMap.toEntity(review, tag);

                reviewTagMapRepository.save(reviewTagMap);
            }
        }

        return review.getReviewNo();
    }

    // review 수정한 내용 Update
    @Transactional
    public void updateReview(Long reviewNo, ReviewDTO reviewDTO, List<MultipartFile> files,
        Long memNo) {

        Review findReview = reviewRepository.findById(reviewNo)
            .orElseThrow(() -> new IllegalArgumentException("작성된 리뷰가 없습니다."));

        // 리뷰 작성자와 현재 로그인한 사용자가 일치하는지 확인
        if (findReview.getOrderItem() == null || findReview.getOrderItem().getOrder() == null
            || findReview.getOrderItem().getOrder().getMember() == null) {
            throw new IllegalArgumentException("주문 정보가 올바르지 않습니다.");
        }

        Long reviewAuthorNo = findReview.getOrderItem().getOrder().getMember().getMemNo();
        if (!reviewAuthorNo.equals(memNo)) {
            throw new IllegalArgumentException("본인이 작성한 리뷰만 수정할 수 있습니다.");
        }

        findReview.update(reviewDTO.getRating(), reviewDTO.getContent());

        List<ReviewImage> findImage = reviewImageRepository.findByReview(findReview);

        if (findImage != null && !findImage.isEmpty()) {
            for (ReviewImage image : findImage) {
                fileUploadService.delete(image.getImageUrl());
            }
        }
        reviewImageRepository.deleteByReview(findReview);

        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                String imageUrl = fileUploadService.upload(file);
                ReviewImage reviewImage = ReviewImage.toEntity(imageUrl, findReview);
                reviewImageRepository.save(reviewImage);
            }
        }

        List<ReviewTagMap> reviewTagMapList = reviewTagMapRepository.findByReview(findReview);

        if (reviewTagMapList != null && !reviewTagMapList.isEmpty()) {
            reviewTagMapRepository.deleteAll(reviewTagMapList);
        }

        if (reviewDTO.getTagIds() != null && !reviewDTO.getTagIds().isEmpty()) {
            for (Long tagId : reviewDTO.getTagIds()) {
                Tag tag = tagRepository.findById(tagId)
                    .orElseThrow(() -> new IllegalArgumentException("일치하는 태그가 없습니다."));
                ReviewTagMap reviewTagMap = ReviewTagMap.toEntity(findReview, tag);
                reviewTagMapRepository.save(reviewTagMap);
            }
        }
    }

    // review 삭제
    @Transactional
    public void delete(Long reviewNo, Long memNo) {

        Review findReview = reviewRepository.findById(reviewNo)
            .orElseThrow(() -> new IllegalArgumentException("해당 리뷰가 없습니다."));

        // 리뷰 작성자와 현재 로그인한 사용자가 일치하는지 확인
        if (findReview.getOrderItem() == null || findReview.getOrderItem().getOrder() == null
            || findReview.getOrderItem().getOrder().getMember() == null) {
            throw new IllegalArgumentException("주문 정보가 올바르지 않습니다.");
        }

        Long reviewAuthorNo = findReview.getOrderItem().getOrder().getMember().getMemNo();
        if (!reviewAuthorNo.equals(memNo)) {
            throw new IllegalArgumentException("본인이 작성한 리뷰만 삭제할 수 있습니다.");
        }

        List<ReviewImage> findImage = reviewImageRepository.findByReview(findReview);

        if (findImage != null && !findImage.isEmpty()) {
            for (ReviewImage image : findImage) {
                fileUploadService.delete(image.getImageUrl());
            }
        }

        reviewRepository.deleteById(reviewNo);

        List<ReviewTagMap> reviewTagMapList = reviewTagMapRepository.findByReview(findReview);

        if (reviewTagMapList != null && !reviewTagMapList.isEmpty()) {
            reviewTagMapRepository.deleteAll(reviewTagMapList);
        }
    }

    // review 1개 조회 (수정하기 페이지)
    public ReviewDTO getReview(Long reviewNo) {
        Review findReview = reviewRepository.findById(reviewNo)
            .orElseThrow(() -> new IllegalArgumentException("리뷰 조회 에러입니다."));
        int likeCount = likeRepository.countByReview(findReview);
        ReviewDTO reviewDTO = ReviewDTO.toDto(findReview, likeCount);
        return reviewDTO;
    }

    // review 모든 목록 조회 (상품페이지에서 등록된 리뷰 목록 조회)
    public List<ReviewDTO> getReviewList(Long prdNo) {
        List<Review> findReviews = reviewRepository.findByOrderItemProductPrdNo(prdNo);
        List<ReviewDTO> reviewDtoList = findReviews.stream().map(review -> {
            int likeCount = likeRepository.countByReview(review);
            return ReviewDTO.toDto(review, likeCount);
        }).collect(Collectors.toList());

        return reviewDtoList;
    }

    // review 재구매 횟수
    public int getBuyCount(Long prdNo, Long reviewNo) {
        Long reviewerMemNo = reviewRepository.getMemberNoByReviewNoAndOrderItemOrderNo(reviewNo);
        int orderItemCounts = orderItemRepository.countOrderItemsByOrderAndOrderItem(prdNo,
            reviewerMemNo);
        return orderItemCounts;
    }

    // review orderItemNo 가져오기
    public Long getOrderItemNo(Long prdNo, Long memNo) {
        Long reviewNo = reviewRepository.findReviewsNoByOrderItemMemberAndPrdNo(
            prdNo, memNo);
        // 리뷰 작성 여부 확인
        if (reviewNo != null && reviewNo > 0) {
            throw new IllegalArgumentException("이미 리뷰를 작성한 상품입니다.");
        }

        ProductEntity product = productRepository.findProductEntityByPrdNo(prdNo);
        if (product == null) {
            throw new IllegalArgumentException("등록되지 않은 상품입니다.");
        }
        Long productNo = product.getPrdNo();

        Pageable topOne = PageRequest.of(0, 1);
        List<Long> orderItemNoTop = orderItemRepository.getOrderItemNoByProductNo(productNo, memNo,
            topOne);
        if(orderItemNoTop == null || orderItemNoTop.isEmpty()){
            throw new IllegalArgumentException("주문한 이력이 없는 상품입니다.");
        }
        Long lastOrderItemNo = orderItemNoTop.isEmpty() ? null : orderItemNoTop.get(0);
        return lastOrderItemNo;
    }

    // 특정 상품의 리뷰 개수 조회
    @Override
    public int getReviewCount(ProductEntity product) {
        List<Review> reviews = reviewRepository.findByOrderItemProductPrdNo(product.getPrdNo());
        return reviews.size();
    }

    // 특정 상품의 평균 평점 조회
    @Override
    public double getAverageRating(ProductEntity product) {
        List<Review> reviews = reviewRepository.findByOrderItemProductPrdNo(product.getPrdNo());
        if (reviews.isEmpty()) {
            return 0.0;
        }

        double sum = reviews.stream().mapToInt(Review::getRating).sum();
        // 소수점 한 자리까지 반올림
        return Math.round((sum / reviews.size()) * 10.0) / 10.0;
    }

    // 태그 기반 상품 구매 경고 알림
    @Transactional(readOnly = true)
    public SimilarSkinStatsDTO getSimilarSkinStats(Long prdNo, Long currentMemberNo) {

        // 현재 로그인한 사용자의 피부 타입 조회
        // (Member 엔티티에 Skin이 연결되어 있다면 member.getSkin().getSkinType()으로 가능)
        SkinProfile userSkin = skinRepository.findByMember_MemNo(currentMemberNo)
            .orElseThrow(() -> new IllegalArgumentException("피부타입 설정을 완료해주세요."));

        String skinType = userSkin.getSkinType();

        // 분모 계산: 이 상품에 대해 'OO' 피부 유저가 쓴 총 리뷰 수
        long totalReviewers = reviewTagMapRepository.countReviewsByProductAndSkinType(prdNo,
            skinType);

        if (totalReviewers == 0) {
            return SimilarSkinStatsDTO.builder().skinType(skinType).totalReviewerCount(0L)
                .topTags(new ArrayList<>()).build();
        }

        // 분자 계산: '지성' 피부 유저가 가장 많이 선택한 태그 Top 3 조회

        Pageable top3 = PageRequest.of(0, 3);
        List<ReviewTagMapRepository.TagStatSimple> topTags = reviewTagMapRepository.findTopTagsByProductAndSkinType(
            prdNo, skinType, top3);

        // 백분율 변환 및 DTO 생성

        List<SimilarSkinStatsDTO.TagStat> stats = topTags.stream().map(tag -> {
            int percentage = (int) Math.round(((double) tag.getCount() / totalReviewers) * 100);
            return new SimilarSkinStatsDTO.TagStat(tag.getTagName(), percentage, tag.getCount(),
                tag.getTagStatus());
        }).collect(Collectors.toList());

        return SimilarSkinStatsDTO.builder().skinType(skinType)
            .totalReviewerCount(totalReviewers)
            .topTags(stats).build();
    }

    // 좋아요 추가/삭제 (토글)
    @Transactional
    public int toggleLike(Long reviewNo, Long memNo) {
        Review review = reviewRepository.findById(reviewNo)
            .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        Member member = memberRepository.findById(memNo)
            .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        boolean exists = likeRepository.existsByMember_MemNoAndReview_ReviewNo(memNo, reviewNo);

        if (exists) {
            // 좋아요 삭제
            likeRepository.findByMember_MemNo(memNo).stream()
                .filter(like -> like.getReview().getReviewNo().equals(reviewNo)).findFirst()
                .ifPresent(likeRepository::delete);
        } else {
            // 좋아요 추가
            ReviewLike reviewLike = ReviewLike.toEntity(member, review);
            likeRepository.save(reviewLike);
        }

        // 업데이트된 좋아요 개수 반환
        return likeRepository.countByReview(review);
    }
}