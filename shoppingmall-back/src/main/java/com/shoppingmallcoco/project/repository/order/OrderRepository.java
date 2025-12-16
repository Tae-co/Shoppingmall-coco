package com.shoppingmallcoco.project.repository.order;

import com.shoppingmallcoco.project.entity.order.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.*;


public interface OrderRepository extends JpaRepository<Order, Long> {

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
    WHERE o.orderNo = :orderNo AND o.member.memNo = :memNo
    """)
    Optional<Order> findDetailByOrderNo(
            @Param("orderNo") Long orderNo,
            @Param("memNo") Long memNo
    );
    
    // 관리자용 검색/필터 쿼리
    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR :status = '' OR o.status = :status) AND " +
           "(:searchTerm IS NULL OR :searchTerm = '' OR " +
           "o.recipientName LIKE %:searchTerm% OR " +
           "CAST(o.orderNo AS string) LIKE %:searchTerm%)")
    Page<Order> findAllByAdminSearch(
            @Param("status") String status, 
            @Param("searchTerm") String searchTerm, 
            Pageable pageable
    );
}
