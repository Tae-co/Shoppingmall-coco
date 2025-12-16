package com.shoppingmallcoco.project.dto.order;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class OrderRequestDto {

    private List<OrderItemDto> orderItems;

    // 배송지 정보
    private String recipientName;
    private String recipientPhone;
    private String orderZipcode;
    private String orderAddress1;
    private String orderAddress2;
    private String deliveryMessage;

    // 결제 정보
    private Long pointsUsed;

    // 포트원 결제 고유 ID (결제 검증 및 취소용)
    private String impUid;


    /**
     * 개별 상품 DTO (Inner Class)
     */
    @Getter
    @Setter
    @NoArgsConstructor
    public static class OrderItemDto {
        private Long prdNo;
        private Long orderQty;
        private Long optionNo;
    }
}