package com.shoppingmallcoco.project.controller;

import com.shoppingmallcoco.project.dto.order.OrderDetailResponseDto;
import com.shoppingmallcoco.project.dto.order.OrderResponseDto;
import com.shoppingmallcoco.project.service.order.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coco/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public Page<OrderResponseDto> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "all") String period
    ) {
        return orderService.getOrders(page, size, period);
    }

    @GetMapping("/{orderNo}")
    public OrderDetailResponseDto getOrderDetail(@PathVariable Long orderNo) {
        return orderService.getOrderDetail(orderNo);
    }
}

