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

@RestController
@CrossOrigin("*")
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductApiController {

    @Autowired
    private ProductService prdService;
    private final ReviewService reviewService;

    /**
     * API: 상품 목록 조회 GET /api/products
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
        // Service 호출
        Page<ProductEntity> productPage = prdService.getProductList(q, skinType, skinConcern,
            personalColor, categoryNo, status, sort, page, size);

        // page -> DTO 변환
        return new ProductListResponseDTO(productPage, prdService);

    }

    /**
     * API: 상품 상세 조회 GET /api/products/{productId}
     */
    @GetMapping("/products/{prdNo}")
    public ProductDetailResponseDTO getProductDetail(@PathVariable(value = "prdNo") Long prdNo) {

        // 기존 ProductService를 호출하여 Entity(ProductDTO)를 받음
        ProductEntity productEntity = prdService.getProductDetail(prdNo);

        if (productEntity == null) {
            return null;
        }

        int reviewCount = prdService.getReviewCount(productEntity);
        double averageRating = prdService.getAverageRating(productEntity);

        ProductDetailResponseDTO responseDTO = new ProductDetailResponseDTO(productEntity,
            reviewCount, averageRating);

        // JSON으로 반환된 DTO를 React에 반환
        return responseDTO;
    }

    // 구매 경고 알림
    @GetMapping("/products/{prdNo}/similar-skin-tags")
    public ResponseEntity<SimilarSkinStatsDTO> getSimilarSkinTagStats(
        @PathVariable Long prdNo, @RequestParam("memberNo") Long memberNo) {

        SimilarSkinStatsDTO result = reviewService.getSimilarSkinStats(prdNo, memberNo);
        return ResponseEntity.ok(result);
    }


}
