package com.shoppingmallcoco.project.service.order;

import com.shoppingmallcoco.project.dto.order.*;
import com.shoppingmallcoco.project.entity.auth.Member;
import com.shoppingmallcoco.project.entity.order.Order;
import com.shoppingmallcoco.project.entity.order.OrderItem;
import com.shoppingmallcoco.project.entity.product.ProductOptionEntity;
import com.shoppingmallcoco.project.repository.order.OrderRepository;
import com.shoppingmallcoco.project.repository.auth.MemberRepository;
import com.shoppingmallcoco.project.repository.product.ProductOptionRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final MemberRepository memberRepository;
    private final ProductOptionRepository productOptionRepository;

    private static final long SHIPPING_FEE = 3000L;
    private static final long FREE_SHIPPING_THRESHOLD = 30000L;

    /**
     * 로그인한 회원 번호 가져오기
     */
    private Long getLoginMemberNo() {
        String memId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        Member member = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        return member.getMemNo();
    }

    /**
     * 주문 생성
     */
    @Transactional
    public Long createOrder(OrderRequestDto requestDto, String memId) {

        Member member = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));

        List<OrderItem> orderItems = new ArrayList<>();
        long totalOrderPrice = 0;

        for (OrderRequestDto.OrderItemDto itemDto : requestDto.getOrderItems()) {
            ProductOptionEntity option = productOptionRepository.findById(itemDto.getOptionNo())
                    .orElseThrow(() -> new RuntimeException("상품 옵션을 찾을 수 없습니다."));

            option.removeStock(itemDto.getOrderQty().intValue());
            
            // 상품 판매량(salesCount) 증가
            option.getProduct().addSalesCount(itemDto.getOrderQty().intValue());

            long realPrice = option.getProduct().getPrdPrice() + option.getAddPrice();

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(option.getProduct());
            orderItem.setProductOption(option);
            orderItem.setOrderQty(itemDto.getOrderQty());
            orderItem.setOrderPrice(realPrice);

            orderItems.add(orderItem);
            totalOrderPrice += realPrice * itemDto.getOrderQty();
        }

        long shippingFee = (totalOrderPrice >= FREE_SHIPPING_THRESHOLD) ? 0 : SHIPPING_FEE;

        long pointsToUse = requestDto.getPointsUsed();
        if (pointsToUse > 0) {
            if (member.getPoint() < pointsToUse) throw new RuntimeException("포인트 부족");
            if (pointsToUse > (totalOrderPrice + shippingFee))
                throw new RuntimeException("결제 금액 초과 사용 불가");
            member.usePoints(pointsToUse);
        }

        long finalTotalPrice = totalOrderPrice + shippingFee - pointsToUse;

        Order order = new Order();
        order.setMember(member);
        order.setOrderDate(LocalDate.now());
        order.setStatus("PENDING");
        order.setTotalPrice(finalTotalPrice);

        order.setRecipientName(requestDto.getRecipientName());
        order.setRecipientPhone(requestDto.getRecipientPhone());
        order.setOrderZipcode(requestDto.getOrderZipcode());
        order.setOrderAddress1(requestDto.getOrderAddress1());
        order.setOrderAddress2(requestDto.getOrderAddress2());
        order.setDeliveryMessage(requestDto.getDeliveryMessage());
        order.setPointsUsed(pointsToUse);

        for (OrderItem orderItem : orderItems) {
            order.addOrderItem(orderItem);
        }

        return orderRepository.save(order).getOrderNo();
    }

    /**
     * 주문 내역 조회 (전체 리스트 방식)
     */
    public List<OrderResponseDto> getOrderHistory(String memId) {
        Member member = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

        List<Order> orders = orderRepository.findAllByMemberMemNoOrderByOrderNoDesc(member.getMemNo());

        return orders.stream()
                .map(OrderResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 주문 취소
     */
    @Transactional
    public void cancelOrder(Long orderNo, String memId) {

        Order order = orderRepository.findById(orderNo)
                .orElseThrow(() -> new RuntimeException("주문 없음"));

        if (!order.getMember().getMemId().equals(memId)) {
            throw new RuntimeException("권한 없음");
        }

        if ("SHIPPED".equals(order.getStatus()))
            throw new RuntimeException("취소 불가");

        for (OrderItem item : order.getOrderItems()) {
            item.getProductOption().addStock(item.getOrderQty().intValue());
            
            // 상품 판매량(salesCount) 감소
            item.getProduct().removeSalesCount(item.getOrderQty().intValue());
        }

        if (order.getPointsUsed() != null && order.getPointsUsed() > 0) {
            order.getMember().returnPoints(order.getPointsUsed());
        }

        order.setStatus("CANCELLED");
    }

    /**
     * 페이징 기반 주문 조회 (기간 필터 포함)
     */
    public Page<OrderResponseDto> getOrders(int page, int size, String period) {

        Long memNo = getLoginMemberNo();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "orderNo"));

        LocalDate fromDate = switch (period) {
            case "3m" -> LocalDate.now().minusMonths(3);
            case "6m" -> LocalDate.now().minusMonths(6);
            case "1y" -> LocalDate.now().minusYears(1);
            default -> null;
        };

        Page<Order> orderPage = (fromDate != null)
                ? orderRepository.findOrdersAfterDate(memNo, fromDate, pageable)
                : orderRepository.findByMember_MemNo(memNo, pageable);

        return orderPage.map(OrderResponseDto::fromEntity);
    }

    /**
     * 주문 상세 조회
     */
    public OrderDetailResponseDto getOrderDetail(Long orderNo) {

        Long memNo = getLoginMemberNo();

        Order order = orderRepository.findDetailByOrderNo(orderNo, memNo)
                .orElseThrow(() -> new SecurityException("주문 조회 권한 없음"));

        List<OrderItemDto> items = order.getOrderItems().stream()
                .map(OrderItemDto::fromEntity)
                .toList();

        return OrderDetailResponseDto.builder()
                .orderNo(order.getOrderNo())
                .orderDate(order.getOrderDate().toString())
                .status(order.getStatus())
                .totalPrice(order.getTotalPrice())
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .orderZipcode(order.getOrderZipcode())
                .orderAddress1(order.getOrderAddress1())
                .orderAddress2(order.getOrderAddress2())
                .items(items)
                .build();
    }
}
