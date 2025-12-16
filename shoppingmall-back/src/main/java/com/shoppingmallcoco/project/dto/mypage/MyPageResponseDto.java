package com.shoppingmallcoco.project.dto.mypage;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MyPageResponseDto {
    private String nickname;
    private Long point;
    private List<RecentOrderDto> recentOrders;
}
