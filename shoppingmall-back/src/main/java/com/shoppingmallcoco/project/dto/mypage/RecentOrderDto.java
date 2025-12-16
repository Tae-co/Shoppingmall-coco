package com.shoppingmallcoco.project.dto.mypage;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RecentOrderDto {
    private Long orderNo;
    private String orderId;
    private String orderDate;
    private Long totalPrice;
    private String status;

    private String mainProductName;
    private String mainOptionName;
    private String thumbnailImage;
    private int extraItemCount;
}
