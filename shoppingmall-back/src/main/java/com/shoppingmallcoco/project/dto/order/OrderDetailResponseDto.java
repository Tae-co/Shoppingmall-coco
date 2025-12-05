package com.shoppingmallcoco.project.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailResponseDto {

    private Long orderNo;
    private String orderDate;
    private String status;
    private Long totalPrice;

    private String recipientName;
    private String recipientPhone;
    private String orderZipcode;
    private String orderAddress1;
    private String orderAddress2;
    private Long pointsUsed;
    
    private Long shippingFee;

    private List<OrderItemDto> items;

}
