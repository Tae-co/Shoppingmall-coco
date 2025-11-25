package com.shoppingmallcoco.project.entity.product;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "PRODUCTOPTION")
public class ProductOptionEntity {

	@Id
	@Column(name = "OPTIONNO")
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "product_option_gen")
	@SequenceGenerator(name = "product_option_gen", sequenceName = "productOption_SEQ", allocationSize = 1)
	private Long optionNo;

	@Column(name = "OPTIONNAME")
	private String optionName;

	@Column(name = "OPTIONVALUE")
	private String optionValue;

	@Column(name = "STOCK")
	private int stock;

	@Column(name = "ADDPRICE")
	private int addPrice;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PRDNO", nullable = false)
	private ProductEntity product;

	public static ProductOptionEntity create(ProductEntity product, String optionName, String optionValue, int addPrice,
			int stock) {
		ProductOptionEntity option = new ProductOptionEntity();
		option.setProduct(product);
		option.setOptionName(optionName);
		option.setOptionValue(optionValue);
		option.setAddPrice(addPrice);
		option.setStock(stock);
		return option;
	}
}
