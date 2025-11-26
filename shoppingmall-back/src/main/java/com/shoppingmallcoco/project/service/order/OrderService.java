package com.shoppingmallcoco.project.service.order;

import com.shoppingmallcoco.project.dto.order.OrderDetailResponseDto;
import com.shoppingmallcoco.project.dto.order.OrderItemDto;
import com.shoppingmallcoco.project.dto.order.OrderResponseDto;
import com.shoppingmallcoco.project.entity.auth.Member;
import com.shoppingmallcoco.project.entity.order.Order;
import com.shoppingmallcoco.project.repository.auth.MemberRepository;
import com.shoppingmallcoco.project.repository.order.OrderRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final MemberRepository memberRepository;

    private Long getLoginMemberNo() {
        String memId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        Member member = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        return member.getMemNo();
    }

    @Transactional(readOnly = true)
    public Page<OrderResponseDto> getOrders(int page, int size, String period) {

        Long memNo = getLoginMemberNo();

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "orderNo"));
        LocalDate fromDate = null;

        switch (period) {
            case "3m": fromDate = LocalDate.now().minusMonths(3); break;
            case "6m": fromDate = LocalDate.now().minusMonths(6); break;
            case "1y": fromDate = LocalDate.now().minusYears(1); break;
        }

        Page<Order> orderPage = (fromDate != null)
                ? orderRepository.findOrdersAfterDate(memNo, fromDate, pageable)
                : orderRepository.findByMember_MemNo(memNo, pageable);

        return orderPage.map(OrderResponseDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public OrderDetailResponseDto getOrderDetail(Long orderNo) {

        Long memNo = getLoginMemberNo();

        Order order = orderRepository.findDetailByOrderNo(orderNo, memNo)
                .orElseThrow(() -> new SecurityException("주문 조회 권한이 없습니다."));

        var items = order.getOrderItems().stream()
                .map(OrderItemDto::fromEntity)
                .toList();

        return OrderDetailResponseDto.builder()
                .orderNo(order.getOrderNo())
                .orderDate(order.getOrderDate().toString())
                .status(order.getStatus())
                .totalPrice(order.getTotalPrice())
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .orderZipcode(order.getOrderZipcode())
                .orderAddress1(order.getOrderAddress1())
                .orderAddress2(order.getOrderAddress2())
                .items(items)
                .build();
    }
}
