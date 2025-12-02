package com.shoppingmallcoco.project.controller;

import com.shoppingmallcoco.project.dto.auth.MemberResponseDto;
import com.shoppingmallcoco.project.dto.order.OrderResponseDto;
import com.shoppingmallcoco.project.service.auth.MemberService;
import com.shoppingmallcoco.project.service.order.AdminOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderApiController {

    private final AdminOrderService adminOrderService;
    private final MemberService memberService;
    
    // 관리자 권한 검증 헬퍼 메서드
    private void checkAdminRole(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new SecurityException("인증이 필요합니다.");
        }
        MemberResponseDto currentMember = memberService.getMemberByMemId(authentication.getName());
        if (currentMember.getRole() == null || 
                (!currentMember.getRole().equals("ADMIN") && !currentMember.getRole().equals("admin"))) {
            throw new SecurityException("관리자 권한이 필요합니다.");
        }
    }

    // 전체 주문 목록 조회
    @GetMapping
    public ResponseEntity<Page<OrderResponseDto>> getAllOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String searchTerm,
            Authentication authentication
    ) {
        checkAdminRole(authentication);
        
        if (page < 1) page = 1;
        if (size < 1 || size > 100) size = 10;
        
        return ResponseEntity.ok(adminOrderService.getAllOrders(page, size, status, searchTerm));
    }

    // 주문 상태 변경
    @PatchMapping("/{orderNo}/status")
    public ResponseEntity<String> updateStatus(
            @PathVariable Long orderNo,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        checkAdminRole(authentication);
        
        if (orderNo == null || orderNo <= 0) {
            return ResponseEntity.badRequest().body("유효하지 않은 주문 번호입니다.");
        }
        
        String status = body.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("주문 상태를 입력해주세요.");
        }
        
        adminOrderService.updateOrderStatus(orderNo, status);
        return ResponseEntity.ok("주문 상태가 변경되었습니다.");
    }
}