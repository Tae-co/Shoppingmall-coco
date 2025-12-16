package com.shoppingmallcoco.project.service.order;

import com.shoppingmallcoco.project.dto.order.OrderResponseDto;
import com.shoppingmallcoco.project.entity.order.Order;
import com.shoppingmallcoco.project.repository.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminOrderService {

    private final OrderRepository orderRepository;

    // 전체 주문 목록 조회 (페이징)
    public Page<OrderResponseDto> getAllOrders(int page, int size) {
    	Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "orderNo"));
        Page<Order> orderPage = orderRepository.findAll(pageable);
        return orderPage.map(OrderResponseDto::fromEntity);
    }
    
    // 검색 조건(status, searchTerm)
    public Page<OrderResponseDto> getAllOrders(int page, int size, String status, String searchTerm) {
        
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "orderNo"));
        
        // Repository의 검색 메서드 호출
        Page<Order> orderPage = orderRepository.findAllByAdminSearch(status, searchTerm, pageable);
        
        return orderPage.map(OrderResponseDto::fromEntity);
    }

    // 주문 상태 변경 (예: 배송중, 배송완료 등)
    public void updateOrderStatus(Long orderNo, String newStatus) {
        Order order = orderRepository.findById(orderNo)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다."));
        order.setStatus(newStatus);
    }
}