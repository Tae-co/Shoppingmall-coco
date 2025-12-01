package com.shoppingmallcoco.project.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shoppingmallcoco.project.entity.product.CategoryEntity;
import com.shoppingmallcoco.project.service.product.CategoryService;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryApiController {

	@Autowired
	private CategoryService categoryService;

	// 카테고리 추가 (POST)
	@PostMapping
	public ResponseEntity<CategoryEntity> createCategory(@RequestBody Map<String, String> request) {
		String categoryName = (String) request.get("categoryName");
		
		// 부모 카테고리 ID 받기 (없으면 null)
	    Long parentCategoryNo = null;
	    if (request.get("parentCategoryNo") != null) {
	        parentCategoryNo = Long.valueOf(String.valueOf(request.get("parentCategoryNo")));
	    }
		
	    CategoryEntity savedCategory = categoryService.createCategory(categoryName, parentCategoryNo);
		return new ResponseEntity<>(savedCategory, HttpStatus.CREATED);
	}

	// 카테고리 수정 (PUT)
	@PutMapping("/{categoryNo}")
	public ResponseEntity<CategoryEntity> updateCategory(@PathVariable(value = "categoryNo") Long categoryNo,
			@RequestBody Map<String, String> request) {
		
		String categoryName = (String) request.get("categoryName");
		
		Long parentCategoryNo = null;
	    if (request.get("parentCategoryNo") != null) {
	        parentCategoryNo = Long.valueOf(String.valueOf(request.get("parentCategoryNo")));
	    }
	    
	    CategoryEntity updatedCategory = categoryService.updateCategory(categoryNo, categoryName, parentCategoryNo);
	    
		return new ResponseEntity<>(updatedCategory, HttpStatus.OK);
	}

	// 카테고리 삭제 (DELETE)
	@DeleteMapping("/{categoryNo}")
	public ResponseEntity<String> deleteCategory(@PathVariable(value = "categoryNo") Long categoryNo) {
		categoryService.deleteCategory(categoryNo);
		return new ResponseEntity<>("카테고리 삭제 성공", HttpStatus.OK);
	}
}
