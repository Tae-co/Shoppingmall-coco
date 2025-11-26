package com.shoppingmallcoco.project.controller;

import com.shoppingmallcoco.project.dto.order.*;
import com.shoppingmallcoco.project.service.order.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    /**
     * 주문 생성
     */
    @PostMapping
    public ResponseEntity<Long> createOrder(
            @RequestBody OrderRequestDto requestDto,
            @AuthenticationPrincipal String memId
    ) {
        try {
            Long orderNo = orderService.createOrder(requestDto, memId);
            return ResponseEntity.status(HttpStatus.CREATED).body(orderNo);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * 주문 내역 조회 - 리스트 (내 주문)
     */
    @GetMapping("/my")
    public ResponseEntity<List<OrderResponseDto>> getMyOrderHistory(
            @AuthenticationPrincipal String memId
    ) {
        List<OrderResponseDto> orderHistory = orderService.getOrderHistory(memId);
        return ResponseEntity.ok(orderHistory);
    }

    /**
     * 주문 취소
     */
    @PostMapping("/{orderNo}/cancel")
    public ResponseEntity<String> cancelOrder(
            @PathVariable Long orderNo,
            @AuthenticationPrincipal String memId
    ) {
        try {
            orderService.cancelOrder(orderNo, memId);
            return ResponseEntity.ok("주문이 성공적으로 취소되었습니다.");

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    /**
     * 주문 목록 조회 - 페이지 기반
     */
    @GetMapping("/page")
    public Page<OrderResponseDto> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "all") String period
    ) {
        return orderService.getOrders(page, size, period);
    }

    /**
     * 주문 상세 조회
     */
    @GetMapping("/{orderNo}")
    public OrderDetailResponseDto getOrderDetail(
            @PathVariable Long orderNo
    ) {
        return orderService.getOrderDetail(orderNo);
    }
}
