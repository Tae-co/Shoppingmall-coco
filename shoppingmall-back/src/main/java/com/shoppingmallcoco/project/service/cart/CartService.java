package com.shoppingmallcoco.project.service.cart;

import com.shoppingmallcoco.project.dto.cart.CartRequestDto;
import com.shoppingmallcoco.project.dto.cart.CartResponseDto;
import com.shoppingmallcoco.project.entity.cart.CartEntity;
import com.shoppingmallcoco.project.entity.auth.Member;
import com.shoppingmallcoco.project.entity.product.ProductOptionEntity;
import com.shoppingmallcoco.project.repository.auth.MemberRepository;
import com.shoppingmallcoco.project.repository.cart.CartRepository;
import com.shoppingmallcoco.project.repository.product.ProductOptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final MemberRepository memberRepository;
    private final ProductOptionRepository productOptionRepository;

    // 현재 로그인한 사용자 조회
    private Member getCurrentMember() {
        String memId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return memberRepository.findByMemId(memId)
                .orElseThrow(() -> new IllegalArgumentException("로그인한 회원이 존재하지 않습니다."));
    }

    private ProductOptionEntity getProductOption(Long optionNo) {
        return productOptionRepository.findById(optionNo)
                .orElseThrow(() -> new IllegalArgumentException("상품 옵션이 존재하지 않습니다."));
    }

    // 장바구니 추가
    @Transactional
    public CartResponseDto addToCart(CartRequestDto dto) {

        Member member = getCurrentMember();
        Long memNo = member.getMemNo();

        ProductOptionEntity option = getProductOption(dto.getOptionNo());

        // 기존 장바구니 항목 확인
        CartEntity existing = cartRepository
                .findByMember_MemNoAndProductOption_OptionNo(memNo, dto.getOptionNo())
                .orElse(null);

        if (existing != null) {
            existing.addQuantity(dto.getCartQty());
            return CartResponseDto.fromEntity(existing);
        }

        CartEntity newCart = CartEntity.create(member, option, dto.getCartQty());
        return CartResponseDto.fromEntity(cartRepository.save(newCart));
    }

    // 장바구니 목록 조회
    public List<CartResponseDto> getCartItems() {

        Member member = getCurrentMember();
        Long memNo = member.getMemNo();

        return cartRepository.findByMember_MemNo(memNo).stream()
                .map(CartResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 수량 변경
    @Transactional
    public CartResponseDto updateCartQty(Long cartNo, Integer qty) {

        Member member = getCurrentMember();
        Long memNo = member.getMemNo();

        CartEntity cart = cartRepository.findById(cartNo)
                .filter(c -> c.getMember().getMemNo().equals(memNo))
                .orElseThrow(() -> new IllegalArgumentException("해당 장바구니가 존재하지 않거나 권한이 없습니다."));

        cart.updateQuantity(qty);
        return CartResponseDto.fromEntity(cart);
    }

    // 단일 상품 삭제
    @Transactional
    public void deleteCart(Long cartNo) {

        Member member = getCurrentMember();
        Long memNo = member.getMemNo();

        CartEntity cart = cartRepository.findById(cartNo)
                .filter(c -> c.getMember().getMemNo().equals(memNo))
                .orElseThrow(() -> new IllegalArgumentException("삭제 권한이 없습니다."));

        cartRepository.delete(cart);
    }

    // 장바구니 비우기
    @Transactional
    public void clearCart() {

        Member member = getCurrentMember();
        Long memNo = member.getMemNo();

        cartRepository.deleteAllByMember_MemNo(memNo);
    }
}
