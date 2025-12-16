package com.shoppingmallcoco.project.controller;

import com.shoppingmallcoco.project.dto.cart.CartRequestDto;
import com.shoppingmallcoco.project.dto.cart.CartResponseDto;
import com.shoppingmallcoco.project.service.cart.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/coco/members/cart")
public class CartController {

    private final CartService cartService;

    // 장바구니 추가
    @PostMapping("/items")
    public ResponseEntity<?> addCart(
            @RequestBody CartRequestDto dto,
            Authentication authentication) {
        
        // 인증 체크
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("인증이 필요합니다.");
        }

        try {
            CartResponseDto result = cartService.addToCart(dto);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // 장바구니 조회
    @GetMapping("/items")
    public ResponseEntity<?> getCartItems(Authentication authentication) {
        
        // 인증 체크
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("인증이 필요합니다.");
        }

        try {
            List<CartResponseDto> items = cartService.getCartItems();
            return ResponseEntity.ok(items);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // 수량 변경
    @PatchMapping("/items/{cartNo}")
    public ResponseEntity<?> updateQty(
            @PathVariable("cartNo") Long cartNo,
            @RequestBody Map<String, Integer> body,
            Authentication authentication) {
        
        // 인증 체크
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("인증이 필요합니다.");
        }

        Integer qty = body.get("qty");
        if (qty == null || qty <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("수량은 1 이상이어야 합니다.");
        }

        try {
            CartResponseDto result = cartService.updateCartQty(cartNo, qty);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    // 항목 삭제
    @DeleteMapping("/items/{cartNo}")
    public ResponseEntity<?> deleteItem(
            @PathVariable("cartNo") Long cartNo,
            Authentication authentication) {
        
        // 인증 체크
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("인증이 필요합니다.");
        }

        try {
            cartService.deleteCart(cartNo);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    // 장바구니 전체 비우기
    @DeleteMapping("/items")
    public ResponseEntity<?> clearCart(Authentication authentication) {
        
        // 인증 체크
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("인증이 필요합니다.");
        }

        try {
            cartService.clearCart();
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
}
