package com.shoppingmallcoco.project.entity.product;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "PRODUCT")
public class ProductEntity {
	
	@Id
	@Column(name = "PRDNO")
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "product_seq_generator")
    @SequenceGenerator(name="product_seq_generator", sequenceName="PRODUCT_SEQ", allocationSize=1)
	private Long prdNo;
	
	@Column(name = "PRDNAME")
	private String prdName;
	
	@Column(name = "PRDPRICE")
	private int prdPrice;
	
	@Lob
	@Column(name = "DESCRIPTION")
	private String description;
	
	@Column(name = "HOWTOUSE")
	private String howToUse;
	
	@Column(name = "REG_DATE")
	private LocalDate regDate;
	
	@Column(name = "SKINTYPE")
    private String skinType;
	
    @Column(name = "SKINCONCERN")
    private String skinConcern;
    
    @Column(name = "PERSONALCOLOR")
    private String personalColor;
    
    @Column(name = "STATUS")
    private String status;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CATEGORY_NO", nullable = false)
	private CategoryEntity category;
	
	@OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ProductOptionEntity> options;
	
	@OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC") // 이미지 순서(sortOrder)대로 정렬 1번이 썸네일
    private List<ProductImageEntity> images;
	
	// 논리적 삭제 여부 (Y: 삭제됨, N: 정상)
    @Column(name = "IS_DELETED", length = 1)
    private String isDeleted = "N"; 
    
    // 삭제 처리 메서드
    public void delete() {
        this.isDeleted = "Y";
    }

}
