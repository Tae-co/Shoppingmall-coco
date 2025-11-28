package com.shoppingmallcoco.project.controller;

import com.shoppingmallcoco.project.dto.order.OrderResponseDto;
import com.shoppingmallcoco.project.service.order.AdminOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderApiController {

    private final AdminOrderService adminOrderService;

    // 전체 주문 목록 조회
    @GetMapping
    public ResponseEntity<Page<OrderResponseDto>> getAllOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String searchTerm
    ) {
        return ResponseEntity.ok(adminOrderService.getAllOrders(page, size, status, searchTerm));
    }

    // 주문 상태 변경
    @PatchMapping("/{orderNo}/status")
    public ResponseEntity<String> updateStatus(
            @PathVariable Long orderNo,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        adminOrderService.updateOrderStatus(orderNo, status);
        return ResponseEntity.ok("주문 상태가 변경되었습니다.");
    }
}