package com.shoppingmallcoco.project.service.mypage;

import com.shoppingmallcoco.project.dto.mypage.MyPageResponseDto;
import com.shoppingmallcoco.project.dto.mypage.RecentOrderDto;
import com.shoppingmallcoco.project.entity.auth.Member;
import com.shoppingmallcoco.project.entity.order.Order;
import com.shoppingmallcoco.project.entity.order.OrderItem;
import com.shoppingmallcoco.project.entity.product.ProductImageEntity;
import com.shoppingmallcoco.project.repository.auth.MemberRepository;
import com.shoppingmallcoco.project.repository.order.OrderRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MyPageService {

    private final MemberRepository memberRepository;
    private final OrderRepository orderRepository;

    public MyPageResponseDto getMyPage() {

        // 필터에서 principal로 넣어준 memId 문자열 그대로 받아옴
        String memId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // memId로 Member 조회
        Member member = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        Long memNo = member.getMemNo();

        // memNo 기준 주문 조회
        List<Order> allOrders =
                orderRepository.findAllByMemberMemNoOrderByOrderNoDesc(memNo);

        List<Order> recentOrders =
                allOrders.size() > 3 ? allOrders.subList(0, 3) : allOrders;

        List<RecentOrderDto> recentOrderDtos = recentOrders.stream()
                .map(this::mapToRecentOrderDto)
                .collect(Collectors.toList());

        return MyPageResponseDto.builder()
                .nickname(member.getMemNickname())
                .point(member.getPoint())
                .recentOrders(recentOrderDtos)
                .build();
    }

    private RecentOrderDto mapToRecentOrderDto(Order order) {
        List<OrderItem> items = order.getOrderItems();

        if (items == null || items.isEmpty()) {
            return RecentOrderDto.builder()
                    .orderNo(order.getOrderNo())
                    .orderId(String.format("ORD-%03d", order.getOrderNo()))
                    .orderDate(order.getOrderDate().format(DateTimeFormatter.ofPattern("yyyy.MM.dd")))
                    .totalPrice(order.getTotalPrice())
                    .status(order.getStatus())
                    .mainProductName("상품 정보 없음")
                    .thumbnailImage(null)
                    .extraItemCount(0)
                    .build();
        }

        OrderItem mainItem = items.get(0);
        String mainProductName = mainItem.getProduct().getPrdName();

        List<ProductImageEntity> images = mainItem.getProduct().getImages();
        String thumbnail = (images != null && !images.isEmpty())
                ? images.stream()
                .filter(img -> img.getSortOrder() == 1)
                .map(ProductImageEntity::getImageUrl)
                .findFirst()
                .orElse(images.get(0).getImageUrl())
                : null;

        return RecentOrderDto.builder()
                .orderNo(order.getOrderNo())
                .orderId(String.format("ORD-%03d", order.getOrderNo()))
                .orderDate(order.getOrderDate().format(DateTimeFormatter.ofPattern("yyyy.MM.dd")))
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .mainProductName(mainProductName)
                .thumbnailImage(thumbnail)
                .extraItemCount(items.size() - 1)
                .build();
    }
}
