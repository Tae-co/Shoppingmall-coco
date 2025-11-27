package com.shoppingmallcoco.project.service.product;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;

import com.shoppingmallcoco.project.entity.product.ProductEntity;
import com.shoppingmallcoco.project.repository.product.ProductRepository;
import com.shoppingmallcoco.project.service.review.IReviewService;

/**
 * 일반 사용자용 상품 조회 및 검색 기능을 담당하는 서비스 클래스
 */
@Service
public class ProductService {

	@Autowired
	private ProductRepository prdRepo;

	@Autowired
	private IReviewService reviewService;
	
	// 검색어 매핑 테이블 (한글 검색어 -> DB에 저장된 영문 태그 값 매핑)
    private static final Map<String, String> SEARCH_KEYWORD_MAP = new HashMap<>();
    
    static {
        // 피부 타입 매핑
        SEARCH_KEYWORD_MAP.put("건성", "dry");
        SEARCH_KEYWORD_MAP.put("지성", "oily");
        SEARCH_KEYWORD_MAP.put("복합성", "combination");
        SEARCH_KEYWORD_MAP.put("민감성", "sensitive");
        SEARCH_KEYWORD_MAP.put("모든 피부", "all");

        // 피부 고민 매핑
        SEARCH_KEYWORD_MAP.put("수분", "hydration");
        SEARCH_KEYWORD_MAP.put("보습", "moisture");
        SEARCH_KEYWORD_MAP.put("미백", "brightening");
        SEARCH_KEYWORD_MAP.put("피부톤", "tone");
        SEARCH_KEYWORD_MAP.put("진정", "soothing");
        SEARCH_KEYWORD_MAP.put("민감", "sensitive");
        SEARCH_KEYWORD_MAP.put("자외선", "uv");
        SEARCH_KEYWORD_MAP.put("자외선차단", "uv");
        SEARCH_KEYWORD_MAP.put("주름", "wrinkle");
        SEARCH_KEYWORD_MAP.put("탄력", "elasticity");
        SEARCH_KEYWORD_MAP.put("모공", "pores");

        // 퍼스널 컬러 매핑
        SEARCH_KEYWORD_MAP.put("봄 웜톤", "spring");
        SEARCH_KEYWORD_MAP.put("여름 쿨톤", "summer");
        SEARCH_KEYWORD_MAP.put("가을 웜톤", "autumn");
        SEARCH_KEYWORD_MAP.put("겨울 쿨톤", "winter");
    }

    /**
	 * 상품 상세 정보를 조회
	 */
	@Transactional(readOnly = true)
	public ProductEntity getProductDetail(Long prdNo) {
		ProductEntity product = prdRepo.findById(prdNo).orElse(null);

		// 연관 데이터(옵션, 이미지) 강제 초기화
		if (product != null) {
			product.getOptions().size();
			product.getImages().size();
		}

		return product;
	}

	/**
	 * 다양한 필터 조건으로 상품 목록을 검색/조회하는 메소드 (동적 쿼리)
	 */
	public Page<ProductEntity> getProductList(String q, List<String> skinType, List<String> skinConcern,
			List<String> personalColor, Long categoryNo, String status, String sort, int page, int size) {

		// 정렬 기준 설정 (Sort 객체 생성)
		Sort sortObj;

		switch (sort) {
		case "idAsc": // 등록순 (ID 오름차순)
			sortObj = Sort.by("prdNo").ascending();
			break;
		case "newest": // 최신순 (ID 내림차순)
			sortObj = Sort.by("prdNo").descending();
			break;
		case "priceAsc": // 낮은 가격순
			sortObj = Sort.by("prdPrice").ascending();
			break;
		case "priceDesc": // 높은 가격순
			sortObj = Sort.by("prdPrice").descending();
			break;
		case "popularity": // 인기순
			//sortObj = Sort.by("salesCount").descending();
			sortObj = Sort.by("prdNo").descending();
			break;
		default: // 기본값
			sortObj = Sort.by("prdNo").ascending();
			break;
		}

		Pageable pageable = PageRequest.of(page - 1, size, sortObj);

		// JPA를 이용한 동적 쿼리 생성
		Specification<ProductEntity> spec = (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();

			// 검색어(q) 필터: 상품명, 설명, 각종 태그 컬럼을 OR 조건으로 검색
			if (q != null && !q.isEmpty()) {
				String originalPattern = "%" + q + "%";
				
				// 원래 검색어(한글)로 이름, 설명 검색
                Predicate nameMatch = cb.like(root.get("prdName"), originalPattern);
                Predicate descMatch = cb.like(root.get("description"), originalPattern);
                
                // 원래 검색어로도 태그 컬럼 검색 (혹시 DB에 한글이 들어갔을 경우 대비)
                Predicate typeMatch = cb.like(root.get("skinType"), originalPattern);
                Predicate concernMatch = cb.like(root.get("skinConcern"), originalPattern);
                Predicate colorMatch = cb.like(root.get("personalColor"), originalPattern);

                // 한글 검색어를 영문 코드로 변환하여 태그 컬럼 추가 검색 (예: '건성' 검색 시 'dry' 포함 여부 확인)
                String mappedKeyword = SEARCH_KEYWORD_MAP.get(q.trim()); // 공백 제거 후 매핑 확인
                
                if (mappedKeyword != null) {
                    String mappedPattern = "%" + mappedKeyword + "%";
                    
                    // 매핑된 영어 값으로 태그 컬럼을 한 번 더 OR 조건에 추가
                    Predicate mappedTypeMatch = cb.like(root.get("skinType"), mappedPattern);
                    Predicate mappedConcernMatch = cb.like(root.get("skinConcern"), mappedPattern);
                    Predicate mappedColorMatch = cb.like(root.get("personalColor"), mappedPattern);
                    
                    // 모든 조건을 OR로 결합
                    predicates.add(cb.or(
                        nameMatch, descMatch, 
                        typeMatch, concernMatch, colorMatch,
                        mappedTypeMatch, mappedConcernMatch, mappedColorMatch
                    ));
                } else {
                    // 매핑되는 영어가 없으면 기존대로 한글 검색만 수행
                    predicates.add(cb.or(nameMatch, descMatch, typeMatch, concernMatch, colorMatch));
                }
            }

			// skinType 필터
			if (skinType != null && !skinType.isEmpty()) {
				List<Predicate> skinTypePredicates = new ArrayList<>();
				if (!skinType.contains("all")) {
					for (String type : skinType) {
						// SKINTYPE 컬럼의 OR 조건
						skinTypePredicates.add(cb.like(root.get("skinType"), "%" + type + "%"));
					}
					predicates.add(cb.or(skinTypePredicates.toArray(new Predicate[0])));
				}
			}

			// skinConcern 필터
			if (skinConcern != null && !skinConcern.isEmpty()) {
				List<Predicate> concernPredicates = new ArrayList<>();
				for (String concern : skinConcern) {
					concernPredicates.add(cb.like(root.get("skinConcern"), "%" + concern + "%"));
				}
				predicates.add(cb.or(concernPredicates.toArray(new Predicate[0])));
			}

			// personalColor 필터
			if (personalColor != null && !personalColor.isEmpty()) {
				List<Predicate> colorPredicates = new ArrayList<>();
				for (String color : personalColor) {
					colorPredicates.add(cb.like(root.get("personalColor"), "%" + color + "%"));
				}
				predicates.add(cb.or(colorPredicates.toArray(new Predicate[0])));
			}

			// 카테고리 필터 (하위 카테고리 포함)
			if (categoryNo != null && categoryNo > 0) {
				// 직속 카테고리인 경우 (예: 크림(5) 선택 -> 크림 상품 조회)
                Predicate directMatch = cb.equal(root.get("category").get("categoryNo"), categoryNo);
                
                // 부모 카테고리인 경우 (예: 스킨케어(1) 선택 -> 부모가 스킨케어인 모든 상품 조회)
                Predicate parentMatch = cb.equal(root.get("category").get("parentCategory").get("categoryNo"), categoryNo);
                
                // 두 조건 중 하나라도 만족하면 됨 (OR 조건)
                predicates.add(cb.or(directMatch, parentMatch));
            }

			// 상태 필터 및 삭제 여부 체크
			if (status != null && !status.isEmpty() && !status.equals("ALL")) {
                predicates.add(cb.equal(root.get("status"), status));
            } else if (!"ALL".equals(status)) {
                // 관리자가 아니면 기본적으로 판매중지(STOP) 상품은 숨김
                predicates.add(cb.notEqual(root.get("status"), "STOP"));
            }

			if (true) {
			    predicates.add(cb.equal(root.get("isDeleted"), "N")); // 논리 삭제된 상품 제외
			}

			return cb.and(predicates.toArray(new Predicate[0]));
		};

		return prdRepo.findAll(spec, pageable);
	}

	public int getReviewCount(ProductEntity product) {
		return reviewService.getReviewCount(product);
	}

	public double getAverageRating(ProductEntity product) {
		return reviewService.getAverageRating(product);
	}

}
