package com.shoppingmallcoco.project.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.shoppingmallcoco.project.dto.auth.MemberResponseDto;
import com.shoppingmallcoco.project.entity.product.CategoryEntity;
import com.shoppingmallcoco.project.service.auth.MemberService;
import com.shoppingmallcoco.project.service.product.CategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryApiController {

	private final CategoryService categoryService;
	private final MemberService memberService;
	
	// 관리자 권한 검증 헬퍼 메서드
	private void checkAdminRole(Authentication authentication) {
		if (authentication == null || authentication.getName() == null) {
			throw new SecurityException("인증이 필요합니다.");
		}
		MemberResponseDto currentMember = memberService.getMemberByMemId(authentication.getName());
		if (currentMember.getRole() == null || 
				(!currentMember.getRole().equals("ADMIN") && !currentMember.getRole().equals("admin"))) {
			throw new SecurityException("관리자 권한이 필요합니다.");
		}
	}

	// 카테고리 추가 (POST)
	@PostMapping
	public ResponseEntity<CategoryEntity> createCategory(
			@RequestBody Map<String, String> request,
			Authentication authentication) {
		checkAdminRole(authentication);
		
		String categoryName = (String) request.get("categoryName");
		if (categoryName == null || categoryName.trim().isEmpty()) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		}
		
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
	public ResponseEntity<CategoryEntity> updateCategory(
			@PathVariable(value = "categoryNo") Long categoryNo,
			@RequestBody Map<String, String> request,
			Authentication authentication) {
		checkAdminRole(authentication);
		
		if (categoryNo == null || categoryNo <= 0) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		}
		
		String categoryName = (String) request.get("categoryName");
		if (categoryName == null || categoryName.trim().isEmpty()) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		}
		
		Long parentCategoryNo = null;
	    if (request.get("parentCategoryNo") != null) {
	        parentCategoryNo = Long.valueOf(String.valueOf(request.get("parentCategoryNo")));
	    }
	    
	    CategoryEntity updatedCategory = categoryService.updateCategory(categoryNo, categoryName, parentCategoryNo);
	    
		return new ResponseEntity<>(updatedCategory, HttpStatus.OK);
	}

	// 카테고리 삭제 (DELETE)
	@DeleteMapping("/{categoryNo}")
	public ResponseEntity<String> deleteCategory(
			@PathVariable(value = "categoryNo") Long categoryNo,
			Authentication authentication) {
		checkAdminRole(authentication);
		
		if (categoryNo == null || categoryNo <= 0) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		}
		
		categoryService.deleteCategory(categoryNo);
		return new ResponseEntity<>("카테고리 삭제 성공", HttpStatus.OK);
	}
}
