package com.shoppingmallcoco.project.dto.order;

import com.shoppingmallcoco.project.entity.order.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDto {

    private String productName;
    private Long qty;
    private Long price;
    private String imageUrl;

    public static OrderItemDto fromEntity(OrderItem item) {

        String imageUrl = null;

        if (item.getProduct().getImages() != null
                && !item.getProduct().getImages().isEmpty()) {
            imageUrl = item.getProduct().getImages().get(0).getImageUrl();
        }

        return new OrderItemDto(
                item.getProduct().getPrdName(),
                item.getOrderQty(),
                item.getOrderPrice(),
                imageUrl
        );
    }
}
