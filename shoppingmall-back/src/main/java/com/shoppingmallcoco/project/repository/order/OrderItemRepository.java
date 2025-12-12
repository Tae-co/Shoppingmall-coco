package com.shoppingmallcoco.project.repository.order;

import com.shoppingmallcoco.project.entity.order.OrderItem;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT COUNT(DISTINCT oi) FROM OrderItem oi " +
        "JOIN oi.order o " +
        "JOIN o.member m " +
        "WHERE oi.product.prdNo = :prdNo AND m.memNo = :memNo")
    int countOrderItemsByOrderAndOrderItem(@Param("prdNo") Long prdNo,
        @Param("memNo") Long memNo);


    // orderItemNo 선택 -> 가장 마지막 구매한 OrderItemNo 불러오기
    @Query("SELECT oi.orderItemNo FROM OrderItem oi "
        + "JOIN oi.order o "
        + "JOIN o.member m "
        + "WHERE oi.product.prdNo = :prdNo AND m.memNo = :memNo "
        + "ORDER BY o.orderNo DESC")
    List<Long> getOrderItemNoByProductNo(@Param("prdNo") Long prdNo, @Param("memNo") Long memNo,
        Pageable pageable);

}
