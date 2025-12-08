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
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;

import java.util.Arrays;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;
    private final TagService tagService;
    private final OrderItemRepository orderItemRepository;
    private final ReviewRepository reviewRepository;
    private final MemberRepository memberRepository;

    // 리뷰 작성 페이지 데이터 저장
    @PostMapping("/reviews")
    public ResponseEntity<Long> insertReview(
        @RequestPart("reviewDTO") ReviewDTO reviewDTO,
        @RequestPart(value = "files", required = false) List<MultipartFile> files,
        Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (reviewDTO == null || reviewDTO.getOrderItemNo() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        // 파일 크기 및 개수 검증
        if (files != null) {
            if (files.size() > 10) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(-1L);
            }
            for (MultipartFile file : files) {
                if (file.isEmpty()) {
                    continue;
                }
                // 파일 크기 검증
                if (file.getSize() > 10 * 1024 * 1024) { // 10MB
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(-1L);
                }
                // 파일 타입 검증 (이미지 파일만 허용)
                String contentType = file.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(-1L);
                }
                // 허용된 이미지 타입만 허용
                List<String> allowedTypes = Arrays.asList(
                    "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
                );
                if (!allowedTypes.contains(contentType.toLowerCase())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(-1L);
                }
            }
        }

        try {
            Member member = memberRepository.findByMemId(authentication.getName())
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

            Long reviewNo = reviewService.insertReview(reviewDTO, files, member.getMemNo());
            return ResponseEntity.ok(reviewNo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }


    // 리뷰 수정페이지 데이터 조회
    @GetMapping("/reviews/{reviewNo}")
    public ResponseEntity<ReviewDTO> getReview(@PathVariable("reviewNo") Long reviewNo) {
        if (reviewNo == null || reviewNo <= 0) {
            return ResponseEntity.badRequest().build();
        }
        try {
            ReviewDTO review = reviewService.getReview(reviewNo);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }


    // 리뷰 수정 데이터 저장
    @PutMapping("/reviews/{reviewNo}")
    public ResponseEntity<Void> updateReview(
        @PathVariable("reviewNo") Long reviewNo,
        @RequestPart("reviewDTO") ReviewDTO reviewDTO,
        @RequestPart(value = "files", required = false) List<MultipartFile> files,
        Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (reviewNo == null || reviewNo <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        if (reviewDTO == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        // 파일 크기 및 개수 검증
        if (files != null) {
            if (files.size() > 10) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            for (MultipartFile file : files) {
                if (file.getSize() > 10 * 1024 * 1024) { // 10MB
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
                }
            }
        }

        try {
            Member member = memberRepository.findByMemId(authentication.getName())
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

            reviewService.updateReview(reviewNo, reviewDTO, files, member.getMemNo());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // 리뷰 삭제
    @DeleteMapping("/reviews/{reviewNo}")
    public ResponseEntity<Void> deleteReview(
        @PathVariable Long reviewNo, 
        Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (reviewNo == null || reviewNo <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        try {
            Member member = memberRepository.findByMemId(authentication.getName())
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

            reviewService.delete(reviewNo, member.getMemNo());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // 리뷰 목록 조회
    @GetMapping("/products/{productNo}/reviews")
    public List<ReviewDTO> getReviews(@PathVariable("productNo") long productNo) {
        return reviewService.getReviewList(productNo);
    }

    // 리뷰 재구매 횟수 조회
    @GetMapping("/products/{productNo}/countReviews/{reviewNo}")
    public int getReviewsCount(@PathVariable Long productNo,
        @PathVariable Long reviewNo) {
        int count = reviewService.getBuyCount(productNo, reviewNo);
        return count;
    }

    // 태그 목록 조회
    @GetMapping("/tags")
    public List<TagDTO> getTags() {
        List<Tag> tagList = tagService.getTagList();
        List<TagDTO> tagDTOList = tagList.stream().map(TagDTO::toDTO).collect(Collectors.toList());
        return tagDTOList;
    }

    // 리뷰 작성 버튼 누를 때 orderItemNo 가져오기
    @GetMapping("/reviews/{prdNo}/getOrderItemNo")
    public Long getOrderItemNo(@PathVariable Long prdNo, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("인증이 필요합니다.");
        }
        Member member = memberRepository.findByMemId(authentication.getName())
            .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

        Long orderItemNo = reviewService.getOrderItemNo(prdNo, member.getMemNo());
        return orderItemNo;
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

    // 리뷰 페이징 및 정렬
    @GetMapping("/products/{prdNo}/reviewPages")
    public Page<ReviewDTO> getReviewPages(@PathVariable("prdNo") Long prdNo,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "latest") String filterType,
        Authentication authentication) {

        Long memNo = null;
        if ("co-mate".equals(filterType)) {
            if (authentication == null || authentication.getName() == null) {
                throw new RuntimeException("Co-mate는 로그인이 필요합니다.");
            }
            Member member = memberRepository.findByMemId(authentication.getName())
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));
            memNo = member.getMemNo();
        }
        return reviewService.getReviewPage(prdNo, memNo, page, size, filterType);
    }

}