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
        if (memId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        if (requestDto == null || requestDto.getOrderItems() == null || requestDto.getOrderItems().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        
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
        if (memId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
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
        if (memId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        if (orderNo == null || orderNo <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("유효하지 않은 주문 번호입니다.");
        }
        
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
    public ResponseEntity<Page<OrderResponseDto>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "all") String period,
            @AuthenticationPrincipal String memId
    ) {
        if (memId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        if (page < 0) page = 0;
        if (size < 1 || size > 100) size = 10;
        
        return ResponseEntity.ok(orderService.getOrders(page, size, period));
    }

    /**
     * 주문 상세 조회
     */
    @GetMapping("/{orderNo}")
    public ResponseEntity<OrderDetailResponseDto> getOrderDetail(
            @PathVariable Long orderNo,
            @AuthenticationPrincipal String memId
    ) {
        if (memId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        if (orderNo == null || orderNo <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        
        try {
            OrderDetailResponseDto orderDetail = orderService.getOrderDetail(orderNo);
            return ResponseEntity.ok(orderDetail);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
