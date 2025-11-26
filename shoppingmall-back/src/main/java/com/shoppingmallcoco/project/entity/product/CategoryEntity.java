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
	private Long categoryNo;

	@Column(name = "CATEGORYNAME")
	private String categoryName;
	
	// 수정일 컬럼 (수정 시 자동 업데이트)
    @LastModifiedDate
    @Column(name = "MOD_DATE")
    private LocalDateTime modDate;
	
	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "PARENT_CATEGORY_NO")
	private CategoryEntity parentCategory;

	@OneToMany(mappedBy = "parentCategory", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonIgnore
	private List<CategoryEntity> children = new ArrayList<>();

	@OneToMany(mappedBy = "category")
	@JsonIgnore
	private List<ProductEntity> products = new ArrayList<>();
}
