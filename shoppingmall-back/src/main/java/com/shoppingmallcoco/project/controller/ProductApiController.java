package com.shoppingmallcoco.project.controller;

import com.shoppingmallcoco.project.dto.review.SimilarSkinStatsDTO;
import com.shoppingmallcoco.project.service.review.ReviewService;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shoppingmallcoco.project.dto.product.ProductDetailResponseDTO;
import com.shoppingmallcoco.project.dto.product.ProductListResponseDTO;
import com.shoppingmallcoco.project.entity.product.ProductEntity;
import com.shoppingmallcoco.project.service.product.ProductService;

/**
 * [일반 사용자용] 상품 관련 REST API 컨트롤러
 * - 상품 목록 조회 (검색, 필터링, 정렬)
 * - 상품 상세 조회 (리뷰 통계 포함)
 * - 구매 경고 알림 (피부 타입 기반 통계)
 */
@RestController
@CrossOrigin("*")
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductApiController {

    @Autowired
    private ProductService prdService;
    private final ReviewService reviewService;

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
     */
    @GetMapping("/products/{prdNo}/similar-skin-tags")
    public ResponseEntity<SimilarSkinStatsDTO> getSimilarSkinTagStats(
        @PathVariable Long prdNo, @RequestParam("memberNo") Long memberNo) {

        SimilarSkinStatsDTO result = reviewService.getSimilarSkinStats(prdNo, memberNo);
        return ResponseEntity.ok(result);
    }


}
