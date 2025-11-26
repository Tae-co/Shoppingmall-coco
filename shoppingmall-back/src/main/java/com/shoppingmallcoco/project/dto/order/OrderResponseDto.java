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

    private List<OrderItemDto> items;

    public static OrderResponseDto fromEntity(Order order) {
        return new OrderResponseDto(
                order.getOrderNo(),
                order.getOrderDate().toString(),
                order.getStatus(),
                order.getTotalPrice(),
                order.getOrderItems().stream()
                        .map(OrderItemDto::fromEntity)
                        .toList()
        );
    }
}
