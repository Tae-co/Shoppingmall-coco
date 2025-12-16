package com.shoppingmallcoco.project.repository.cart;

import com.shoppingmallcoco.project.entity.cart.CartEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<CartEntity, Long> {

    // 회원별 장바구니 조회
    List<CartEntity> findByMember_MemNo(Long memNo);

    // 특정 회원이 특정 옵션 상품을 이미 장바구니에 담았는지 확인
    Optional<CartEntity> findByMember_MemNoAndProductOption_OptionNo(Long memNo, Long optionNo);

    // 장바구니 항목 삭제
    void deleteByCartNo(Long cartNo);

    // 회원의 장바구니 전체 비우기
    void deleteAllByMember_MemNo(Long memNo);
}

