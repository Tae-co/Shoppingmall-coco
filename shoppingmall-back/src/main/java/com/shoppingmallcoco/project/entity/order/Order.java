package com.shoppingmallcoco.project.entity.order;

import com.shoppingmallcoco.project.entity.auth.Member;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "\"ORDER\"")
public class Order {


    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "order_seq_gen")
    @SequenceGenerator(name = "order_seq_gen", sequenceName = "order_SEQ", allocationSize = 1)
    @Column(name = "orderNo")
    private Long orderNo;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "memNo", nullable = false)
    private Member member;



    @Column(name = "orderDate")
    private LocalDate orderDate;

    @Column(name = "totalPrice")
    private Long totalPrice;

    @Column(name = "status", length = 20)
    private String status;

    // --- 주소 정보 ---
    @Column(name = "orderZipcode", length = 100)
    private String orderZipcode;

    @Column(name = "orderAddress1", length = 100)
    private String orderAddress1;

    @Column(name = "orderAddress2", length = 100)
    private String orderAddress2;

    // --- 수령인 및 기타 정보 ---
    @Column(name = "recipientName", length = 100)
    private String recipientName;

    @Column(name = "recipientPhone", length = 20)
    private String recipientPhone;

    @Column(name = "deliveryMessage", length = 255)
    private String deliveryMessage;

    @Column(name = "pointsUsed")
    private Long pointsUsed;

    // --- 관계 설정 ---
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems = new ArrayList<>();

    // --- 연관관계 편의 메서드 ---
    public void addOrderItem(OrderItem orderItem) {
        orderItems.add(orderItem);
        orderItem.setOrder(this);
    }
}