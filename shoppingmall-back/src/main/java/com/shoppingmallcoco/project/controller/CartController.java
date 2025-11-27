package com.shoppingmallcoco.project.controller;

import com.shoppingmallcoco.project.dto.cart.CartRequestDto;
import com.shoppingmallcoco.project.dto.cart.CartResponseDto;
import com.shoppingmallcoco.project.service.cart.CartService;
import lombok.RequiredArgsConstructor;
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
    public CartResponseDto addCart(@RequestBody CartRequestDto dto) {
        return cartService.addToCart(dto);
    }

    // 장바구니 조회
    @GetMapping("/items")
    public List<CartResponseDto> getCartItems() {
        return cartService.getCartItems();
    }

    // 수량 변경
    @PatchMapping("/items/{cartNo}")
    public CartResponseDto updateQty(@PathVariable("cartNo") Long cartNo,
                                     @RequestBody Map<String, Integer> body) {
        Integer qty = body.get("qty");
        return cartService.updateCartQty(cartNo, qty);
    }

    // 항목 삭제
    @DeleteMapping("/items/{cartNo}")
    public void deleteItem(@PathVariable("cartNo") Long cartNo) {
        cartService.deleteCart(cartNo);
    }

    // 장바구니 전체 비우기
    @DeleteMapping("/items/clear")
    public void clearCart() {
        cartService.clearCart();
    }
}
