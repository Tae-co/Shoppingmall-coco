package com.shoppingmallcoco.project.repository.order;

import com.shoppingmallcoco.project.entity.order.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.*;

public interface OrderRepository extends JpaRepository<Order, Long>{
    List<Order> findAllByMemberMemNoOrderByOrderNoDesc(Long memNo);

    // 전체 조회
    Page<Order> findByMember_MemNo(Long memNo, Pageable pageable);

    // 기간 조회
    @Query("SELECT o FROM Order o WHERE o.member.memNo = :memNo AND o.orderDate >= :fromDate")
    Page<Order> findOrdersAfterDate(
            @Param("memNo") Long memNo,
            @Param("fromDate") LocalDate fromDate,
            Pageable pageable
    );

    @Query("""
    SELECT DISTINCT o
    FROM Order o
    LEFT JOIN FETCH o.orderItems oi
    LEFT JOIN FETCH oi.product p
    LEFT JOIN FETCH p.images img
    WHERE o.orderNo = :orderNo AND o.member.memNo = :memNo
    """)
    Optional<Order> findDetailByOrderNo(
            @Param("orderNo") Long orderNo,
            @Param("memNo") Long memNo
    );
}
