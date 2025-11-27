package com.shoppingmallcoco.project.dto.order;

import com.shoppingmallcoco.project.entity.order.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDto {

    private Long orderNo;
    private String orderDate;
    private String status;
    private Long totalPrice;

    // 배송지 및 주문자 정보
    private String recipientName;
    private String recipientPhone;
    private String orderZipcode;
    private String orderAddress1;
    private String orderAddress2;
    private String deliveryMessage;
    private Long pointsUsed;

    // 주문 상품 목록
    private List<OrderItemDto> items;

    public static OrderResponseDto fromEntity(Order order) {
        return new OrderResponseDto(
                order.getOrderNo(),
                order.getOrderDate().toString(),
                order.getStatus(),
                order.getTotalPrice(),
                order.getRecipientName(),
                order.getRecipientPhone(),
                order.getOrderZipcode(),
                order.getOrderAddress1(),
                order.getOrderAddress2(),
                order.getDeliveryMessage(),
                order.getPointsUsed(),
                order.getOrderItems().stream()
                        .map(OrderItemDto::fromEntity)
                        .toList()
        );
    }
}
