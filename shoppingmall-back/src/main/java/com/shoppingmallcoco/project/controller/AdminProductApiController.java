package com.shoppingmallcoco.project.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

import com.shoppingmallcoco.project.dto.product.ProductSaveDTO;
import com.shoppingmallcoco.project.dto.product.ProductDetailResponseDTO;
import com.shoppingmallcoco.project.entity.product.ProductEntity;
import com.shoppingmallcoco.project.service.product.AdminProductService;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/admin")
public class AdminProductApiController {
	
	@Autowired
	private AdminProductService prdService;
	
	/**
     * API: 관리자 상품 등록
     * POST /api/admin/products
     */
	@PostMapping(value = "/products", consumes = { "multipart/form-data" })
	public ResponseEntity<ProductDetailResponseDTO> createProduct(
            @RequestPart(value = "dto") ProductSaveDTO requestDTO,
            @RequestPart(value = "imageFiles", required = false) List<MultipartFile> files
    ) throws IOException { 
		
		ProductEntity createdProduct = prdService.createProduct(requestDTO, files);
        
		int reviewCount = prdService.getReviewCount(createdProduct);
        double averageRating = prdService.getAverageRating(createdProduct);
        
        ProductDetailResponseDTO responseDTO = new ProductDetailResponseDTO(createdProduct, reviewCount, averageRating);
        
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }
	
	/**
     * API: 관리자 상품 수정
     * PUT /api/admin/products/{prdNo}
     */
	@PutMapping(value = "/products/{prdNo}", consumes = { "multipart/form-data" })
    public ResponseEntity<ProductDetailResponseDTO> updateProduct(
    		@PathVariable(value = "prdNo") Long prdNo,
            @RequestPart(value = "dto") ProductSaveDTO requestDTO,
            @RequestPart(value = "imageFiles", required = false) List<MultipartFile> files
    ) throws IOException {
        
        ProductEntity updatedProduct = prdService.updateProduct(prdNo, requestDTO, files);
        
        int reviewCount = prdService.getReviewCount(updatedProduct);
        double averageRating = prdService.getAverageRating(updatedProduct);
        
        return new ResponseEntity<>(
            new ProductDetailResponseDTO(updatedProduct, reviewCount, averageRating), 
            HttpStatus.OK
        );
    }

    /**
     * API: 관리자 상품 삭제
     * DELETE /api/admin/products/{prdNo}
     */
    @DeleteMapping("/products/{prdNo}")
    public ResponseEntity<String> deleteProduct(
    		@PathVariable(value = "prdNo") Long prdNo
    		) {
        prdService.deleteProduct(prdNo);
        return new ResponseEntity<>("상품 삭제 성공", HttpStatus.OK);
    }
    
    /**
     * API: 대시보드 통계 데이터 조회
     * GET /api/admin/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        Map<String, Long> stats = prdService.getDashboardStats();
        return new ResponseEntity<>(stats, HttpStatus.OK);
    }
}
