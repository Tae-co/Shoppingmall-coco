package com.shoppingmallcoco.project.service.product;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shoppingmallcoco.project.entity.product.CategoryEntity;
import com.shoppingmallcoco.project.repository.product.CategoryRepository;

import lombok.RequiredArgsConstructor;

/**
 * 카테고리 관리 비즈니스 로직 서비스
 * - 카테고리 생성, 수정(부모-자식 관계 변경 포함), 삭제 기능 제공
 */
@Service
@RequiredArgsConstructor
public class CategoryService {
	
	private final CategoryRepository catRepo;
	
	// 카테고리 생성
    @Transactional
    public CategoryEntity createCategory(String categoryName, Long parentCategoryNo) {
        CategoryEntity category = new CategoryEntity();
        category.setCategoryName(categoryName);
        
        if (parentCategoryNo != null) {
            CategoryEntity parent = catRepo.findById(parentCategoryNo)
                    .orElseThrow(() -> new RuntimeException("부모 카테고리를 찾을 수 없습니다."));
            category.setParentCategory(parent);
        }
        
        return catRepo.save(category);
    }
	
    /**
	 * 카테고리 정보 수정
	 * - 이름 변경 및 상위 카테고리 이동 기능 포함
	 * - 자기 자신을 상위 카테고리로 설정하는 순환 참조 방지 로직 포함
	 */
	@Transactional
	public CategoryEntity updateCategory(Long categoryNo, String categoryName, Long parentCategoryNo) {
	    CategoryEntity category = catRepo.findById(categoryNo)
	            .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));

	    // 이름 수정
	    category.setCategoryName(categoryName);

	    // 부모 카테고리 수정
	    if (parentCategoryNo == null) {
	        category.setParentCategory(null); 
	    } else {
	        if(categoryNo.equals(parentCategoryNo)) {
	             throw new RuntimeException("자기 자신을 상위 카테고리로 설정할 수 없습니다.");
	        }
	        
	        CategoryEntity parent = catRepo.findById(parentCategoryNo)
	                .orElseThrow(() -> new RuntimeException("부모 카테고리가 존재하지 않습니다."));
	        category.setParentCategory(parent);
	    }

	    return catRepo.save(category);
	}
	
	/**
	 * 카테고리 삭제
	 * - 하위 카테고리나 상품이 연결된 경우 제약조건에 따라 처리가 달라질 수 있음
	 */
	@Transactional
	public void deleteCategory(Long categoryNo) {
		catRepo.deleteById(categoryNo);
	}

}
