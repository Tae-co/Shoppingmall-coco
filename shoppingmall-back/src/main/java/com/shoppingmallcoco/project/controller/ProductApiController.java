package com.shoppingmallcoco.project.controller;

import com.shoppingmallcoco.project.dto.review.SimilarSkinStatsDTO;
import com.shoppingmallcoco.project.service.review.ReviewService;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.shoppingmallcoco.project.dto.product.ProductDetailResponseDTO;
import com.shoppingmallcoco.project.dto.product.ProductListResponseDTO;
import com.shoppingmallcoco.project.entity.auth.Member;
import com.shoppingmallcoco.project.entity.product.ProductEntity;
import com.shoppingmallcoco.project.repository.auth.MemberRepository;
import com.shoppingmallcoco.project.service.product.ProductService;

/**
 * [일반 사용자용] 상품 관련 REST API 컨트롤러
 * - 상품 목록 조회 (검색, 필터링, 정렬)
 * - 상품 상세 조회 (리뷰 통계 포함)
 * - 구매 경고 알림 (피부 타입 기반 통계)
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductApiController {

	private final ProductService prdService; 
    private final ReviewService reviewService;
    private final MemberRepository memberRepository;

    /**
     * 상품 목록 조회 API (GET /api/products)
     * 다양한 검색 조건(필터)을 파라미터로 받아 페이징된 상품 목록을 반환함
     */

    @GetMapping("/products")
    public ProductListResponseDTO getProductList(
        @RequestParam(value = "q", required = false) String q,
        @RequestParam(value = "skinType", required = false) List<String> skinType,
        @RequestParam(value = "skinConcern", required = false) List<String> skinConcern,
        @RequestParam(value = "personalColor", required = false) List<String> personalColor,
        @RequestParam(value = "categoryNo", required = false) Long categoryNo,
        @RequestParam(value = "status", required = false) String status,
        @RequestParam(value = "sort", required = false, defaultValue = "popularity") String sort,
        @RequestParam(value = "page", required = false, defaultValue = "1") int page,
        @RequestParam(value = "size", required = false, defaultValue = "6") int size
    ) {
        // 입력 검증
        if (page < 1) page = 1;
        if (size < 1 || size > 100) size = 6;
        
        // 검색어 길이 제한
        if (q != null && q.length() > 100) {
            q = q.substring(0, 100);
        }
        // Service를 호출하여 필터링된 Entity Page 객체 획득
        Page<ProductEntity> productPage = prdService.getProductList(q, skinType, skinConcern,
            personalColor, categoryNo, status, sort, page, size);

        // Page<Entity>를 프론트엔드용 DTO로 변환하여 반환
        return new ProductListResponseDTO(productPage, prdService);

    }

    /**
     * 상품 상세 조회 API (GET /api/products/{prdNo})
     * 특정 상품의 상세 정보와 리뷰 통계(개수, 평점)를 함께 반환함
     */
    @GetMapping("/products/{prdNo}")
    public ProductDetailResponseDTO getProductDetail(@PathVariable(value = "prdNo") Long prdNo) {
        // 입력 검증
        if (prdNo == null || prdNo <= 0) {
            return null;
        }

        // 상품 Entity 조회
        ProductEntity productEntity = prdService.getProductDetail(prdNo);

        if (productEntity == null) {
            return null;
        }

        // 리뷰 통계 데이터 조회
        int reviewCount = prdService.getReviewCount(productEntity);
        double averageRating = prdService.getAverageRating(productEntity);

        // DTO 생성 및 반환
        ProductDetailResponseDTO responseDTO = new ProductDetailResponseDTO(productEntity,
            reviewCount, averageRating);

        return responseDTO;
    }

    /**
     * [구매 경고/추천 알림] 유사 피부 타입 사용자 통계 조회
     * 현재 보고 있는 상품에 대해, 나와 같은 피부 타입을 가진 다른 사용자들이
     * 어떤 태그(장점/단점)를 많이 선택했는지 통계 정보를 제공
     * 
     * 보안: 인증된 사용자의 memberNo만 사용하여 다른 사용자의 정보 노출 방지
     */
    @GetMapping("/products/{prdNo}/similar-skin-tags")
    public ResponseEntity<SimilarSkinStatsDTO> getSimilarSkinTagStats(
        @PathVariable Long prdNo, 
        Authentication authentication) {
        
        // 인증 체크
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // 입력 검증
        if (prdNo == null || prdNo <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        try {
            // 현재 로그인한 사용자의 memberNo 조회
            Member member = memberRepository.findByMemId(authentication.getName())
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));
            
            // 인증된 사용자의 memberNo만 사용
            Long memberNo = member.getMemNo();
            
            SimilarSkinStatsDTO result = reviewService.getSimilarSkinStats(prdNo, memberNo);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 검색어 매핑 정보 조회 API
     * 프론트엔드에서 한글 필터(예: 건성)를 영문 태그(예: dry)로 변환할 때 사용할 매핑 테이블을 반환
     * 이 API를 통해 프론트엔드에 하드코딩된 매핑 정보를 제거하고, 백엔드와 동기화
     */
    @GetMapping("/codes/search-keywords")
    public ResponseEntity<Map<String, String>> getSearchKeywords() {
        return ResponseEntity.ok(prdService.getSearchKeywordMap());
    }


}
