package com.shoppingmallcoco.project.dto.cart;

import com.shoppingmallcoco.project.entity.cart.CartEntity;
import com.shoppingmallcoco.project.entity.product.ProductEntity;
import com.shoppingmallcoco.project.entity.product.ProductOptionEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponseDto {

    private Long cartNo;
    private Long memNo;
    private Long optionNo;
    private Integer cartQty;

    // 조회용 상품 정보
    private String productName;
    private Integer productPrice;
    private String productImage;

    public static CartResponseDto fromEntity(CartEntity cart) {

        ProductOptionEntity option = cart.getProductOption();
        ProductEntity product = option.getProduct();

        // 상품명 + 옵션값 조합
        String fullName = product.getPrdName();
        if (option.getOptionValue() != null) {
            fullName += " " + option.getOptionValue();
        }

        // 옵션 추가금 반영한 최종 가격
        int finalPrice = product.getPrdPrice()
                + (option.getAddPrice() != 0 ? option.getAddPrice() : 0);

        // 대표 이미지(첫 번째 이미지 가져오기)
        String imageUrl = null;
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            imageUrl = product.getImages().get(0).getImageUrl();
        }

        return CartResponseDto.builder()
                .cartNo(cart.getCartNo())
                .memNo(cart.getMember().getMemNo())
                .optionNo(option.getOptionNo())
                .cartQty(cart.getCartQty())

                .productName(fullName)
                .productPrice(finalPrice)
                .productImage(imageUrl)

                .build();
    }
}

