package com.shoppingmallcoco.project.controller;

import com.shoppingmallcoco.project.dto.review.ReviewDTO;
import com.shoppingmallcoco.project.dto.review.TagDTO;
import com.shoppingmallcoco.project.entity.auth.Member;
import com.shoppingmallcoco.project.entity.review.Tag;
import com.shoppingmallcoco.project.repository.order.OrderItemRepository;
import com.shoppingmallcoco.project.repository.review.ReviewRepository;
import com.shoppingmallcoco.project.repository.auth.MemberRepository;
import com.shoppingmallcoco.project.service.review.ReviewService;
import com.shoppingmallcoco.project.service.review.TagService;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    private final ReviewService reviewService;
    private final TagService tagService;
    private final OrderItemRepository orderItemRepository;
    private final ReviewRepository reviewRepository;
    private final MemberRepository memberRepository;

    // 리뷰 작성 페이지 데이터 저장
    @PostMapping("/reviews")
    public Long insertReview(@RequestPart("reviewDTO") ReviewDTO reviewDTO,
        @RequestPart(value = "files", required = false) List<MultipartFile> files,
        Authentication authentication) {
        
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("인증이 필요합니다.");
        }
        
        Member member = memberRepository.findByMemId(authentication.getName())
            .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

        Long reviewNo = reviewService.insertReview(reviewDTO, files, member.getMemNo());
        return reviewNo;
    }


    // 리뷰 수정페이지 데이터 조회
    @GetMapping("/reviews/{reviewNo}")
    public ReviewDTO getReview(@PathVariable("reviewNo") Long reviewNo) {
        return reviewService.getReview(reviewNo);
    }


    // 리뷰 수정 데이터 저장
    @PutMapping("/reviews/{reviewNo}")
    public void updateReview(@PathVariable("reviewNo") long reviewNo,
        @RequestPart("reviewDTO") ReviewDTO reviewDTO,
        @RequestPart(value = "files", required = false) List<MultipartFile> files,
        Authentication authentication) {
        
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("인증이 필요합니다.");
        }
        
        Member member = memberRepository.findByMemId(authentication.getName())
            .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));
        
        reviewService.updateReview(reviewNo, reviewDTO, files, member.getMemNo());
    }

    // 리뷰 삭제
    @DeleteMapping("/reviews/{reviewNo}")
    public void deleteReview(@PathVariable long reviewNo, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("인증이 필요합니다.");
        }
        
        Member member = memberRepository.findByMemId(authentication.getName())
            .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));
        
        reviewService.delete(reviewNo, member.getMemNo());
    }

    // 리뷰 목록 조회
    @GetMapping("/products/{productNo}/reviews")
    public List<ReviewDTO> getReviews(@PathVariable("productNo") long productNo) {
        return reviewService.getReviewList(productNo);
    }

    // 태그 목록 조회
    @GetMapping("/tags")
    public List<TagDTO> getTags() {
        List<Tag> tagList = tagService.getTagList();
        List<TagDTO> tagDTOList = tagList.stream().map(TagDTO::toDTO).collect(Collectors.toList());
        return tagDTOList;
    }

    //orderItemNo 유뮤 확인
    @GetMapping("/orderItems/{orderItemNo}/check")
    public ResponseEntity<?> checkOrderItems(@PathVariable Long orderItemNo) {
        boolean exists = orderItemRepository.existsById(orderItemNo);
        if (exists) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    //reviewNo 유무 확인
    @GetMapping("/review/{reviewNo}/check")
    public ResponseEntity<?> checkReviewNo(@PathVariable Long reviewNo) {
        boolean exists = reviewRepository.existsById(reviewNo);
        if (exists) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    // 좋아요 추가/삭제 (토글)
    @PostMapping("/reviews/{reviewNo}/like")
    public int toggleLike(@PathVariable("reviewNo") Long reviewNo, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("인증이 필요합니다.");
        }
        Member member = memberRepository.findByMemId(authentication.getName())
            .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));
        return reviewService.toggleLike(reviewNo, member.getMemNo());
    }

}