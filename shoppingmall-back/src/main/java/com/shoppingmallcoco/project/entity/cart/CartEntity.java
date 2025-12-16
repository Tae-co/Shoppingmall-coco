package com.shoppingmallcoco.project.entity.cart;

import com.shoppingmallcoco.project.entity.auth.Member;
import com.shoppingmallcoco.project.entity.product.ProductOptionEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "CART")
public class CartEntity {

    @Id
    @SequenceGenerator(
            name = "CART_SEQ_GENERATOR",
            sequenceName = "CART_SEQ",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "CART_SEQ_GENERATOR"
    )
    @Column(name = "CARTNO")
    private Long cartNo;

    // 회원 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MEMNO", nullable = false)
    private Member member;

    // 상품 옵션 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OPTIONNO", nullable = false)
    private ProductOptionEntity productOption;

    // 수량
    @Column(name = "CARTQTY", nullable = false)
    private Integer cartQty;

    // 수량 변경
    public void updateQuantity(int qty) {
        this.cartQty = qty;
    }

    // 수량 추가
    public void addQuantity(int qty) {
        this.cartQty += qty;
    }

    // cart 생성
    public static CartEntity create(Member member, ProductOptionEntity option, int qty) {
        CartEntity cart = new CartEntity();
        cart.member = member;
        cart.productOption = option;
        cart.cartQty = qty;
        return cart;
    }
}

