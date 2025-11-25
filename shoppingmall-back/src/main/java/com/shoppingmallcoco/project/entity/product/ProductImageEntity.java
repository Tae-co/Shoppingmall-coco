package com.shoppingmallcoco.project.entity.product;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "PRODUCTIMAGE")
public class ProductImageEntity {

	@Id
	@Column(name = "PRODUCTIMAGENO")
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "product_image_gen")
	@SequenceGenerator(name = "product_image_gen", sequenceName = "productImage_SEQ", allocationSize = 1)
	private Long productImageNo;

	@Column(name = "IMAGEURL")
	private String imageUrl;

	@Column(name = "SORTORDER")
	private Integer sortOrder;

	// (양방향 연관관계 - 이 이미지가 속한 상품)
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PRDNO", nullable = false)
	private ProductEntity product;

}
