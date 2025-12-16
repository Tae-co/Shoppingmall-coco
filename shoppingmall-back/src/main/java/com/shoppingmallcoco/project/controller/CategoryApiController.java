package com.shoppingmallcoco.project.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import com.shoppingmallcoco.project.dto.product.CategoryDTO;
import com.shoppingmallcoco.project.repository.product.CategoryRepository;

import lombok.RequiredArgsConstructor;

/**
 * [공통 API] 카테고리 조회 컨트롤러
 * - 쇼핑몰 전반에서 사용되는 카테고리 목록 조회 기능을 제공함
 * - 관리자 페이지와 사용자 페이지(헤더, 필터 등)에서 공통으로 사용
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CategoryApiController {

	private final CategoryRepository catRepo;

    /**
     * API: 카테고리 목록 조회
     * [GET] /api/categories
     * 모든 카테고리를 ID(categoryNo) 오름차순으로 정렬하여 반환
     * 계층 구조(대분류/소분류)는 프론트엔드에서 parentCategoryNo를 이용해 조립하여 사용
     */
    @GetMapping("/categories")
    public List<CategoryDTO> getAllCategories() {
        return catRepo.findAll(Sort.by(Sort.Direction.ASC, "categoryNo")).stream()
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
    }
}