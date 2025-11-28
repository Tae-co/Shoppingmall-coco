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

    //배송지 및 주문자 정보
    private String recipientName;
    private String recipientPhone;
    private String orderZipcode;
    private String orderAddress1;
    private String orderAddress2;
    private String deliveryMessage;
    private Long pointsUsed;

    //주문 상품 목록
    private List<OrderItemDto> items;

    //대표이미지, 대표상품, 외 n건 처리
    private String mainProductName;
    private String thumbnailImage;
    private int extraItemCount;

    public static OrderResponseDto fromEntity(Order order) {

        var items = order.getOrderItems();
        boolean hasItems = !items.isEmpty();

        String mainProductName = "상품 없음";
        String thumbnailImage = "/default-product.png";

        if (hasItems) {
            var firstItem = items.get(0);
            mainProductName = firstItem.getProduct().getPrdName();

            if (firstItem.getProduct().getImages() != null
                    && !firstItem.getProduct().getImages().isEmpty()) {
                thumbnailImage = firstItem.getProduct().getImages().get(0).getImageUrl();
            }
        }

        int extraItemCount = Math.max(items.size() - 1, 0);

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
                items.stream()
                        .map(OrderItemDto::fromEntity)
                        .toList(),
                mainProductName,
                thumbnailImage,
                extraItemCount
        );
    }
}
