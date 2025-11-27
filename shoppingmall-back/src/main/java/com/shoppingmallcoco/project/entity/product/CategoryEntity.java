package com.shoppingmallcoco.project.entity.product;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * 카테고리 정보를 담는 엔티티 클래스 (CATEGORY 테이블 매핑)
 * - 카테고리 이름 및 대분류/소분류 계층 구조를 관리함
 * - 자기 자신을 부모(parentCategory)로 참조하여 계층형 구조를 구현함
 */
@Entity
@Getter
@Setter
@Table(name = "CATEGORY")
@EntityListeners(AuditingEntityListener.class)
public class CategoryEntity {
	
	@Id
	@Column(name = "CATEGORYNO")
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "category_seq_gen")
	@SequenceGenerator(
        name = "category_seq_gen", 
        sequenceName = "CATEGORY_SEQ",
        allocationSize = 1
        )
	private Long categoryNo; // 카테고리 고유 ID
	
	@Column(name = "CATEGORYNAME")
	private String categoryName; // 카테고리 명 (예: 스킨케어, 토너 등)
	
	// 카테고리 순서 변경 등의 관리를 위해 수정 시간을 기록
    @LastModifiedDate
    @Column(name = "MOD_DATE")
    private LocalDateTime modDate;
	
    /**
     * 상위 카테고리 (대분류)
     * null이면 최상위 대분류를 의미함
     */
	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "PARENT_CATEGORY_NO")
	private CategoryEntity parentCategory;
	
	/**
     * 하위 카테고리 목록 (소분류들)
     * 부모 카테고리 삭제 시 하위 카테고리도 함께 삭제됨
     */
	@OneToMany(mappedBy = "parentCategory", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonIgnore // API 응답 시 무한 루프 방지를 위해 JSON 변환에서 제외
	private List<CategoryEntity> children = new ArrayList<>();
	
	// 해당 카테고리에 속한 상품 목록 (역방향 조회용)
	@OneToMany(mappedBy = "category")
	@JsonIgnore
	private List<ProductEntity> products = new ArrayList<>();
}
