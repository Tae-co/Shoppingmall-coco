package com.shoppingmallcoco.project.entity.order;

import com.shoppingmallcoco.project.entity.product.ProductEntity;
import com.shoppingmallcoco.project.entity.product.ProductOptionEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "orderitem") // DB 테이블명
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "orderitem_seq_gen")
    @SequenceGenerator(name = "orderitem_seq_gen", sequenceName = "orderitem_SEQ", allocationSize = 1)
    @Column(name = "orderitemNo")
    private Long orderItemNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prdNo", nullable = false) // DB 컬럼 'prdNo'와 연결
    private ProductEntity product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OptionNo", nullable = false) // DB 컬럼 'OptionNo'와 연결
    private ProductOptionEntity productOption;

    @Column(name = "price", nullable = false)
    private Long orderPrice;

    @Column(name = "qty", nullable = false)
    private Long orderQty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orderNo")
    private Order order;
}