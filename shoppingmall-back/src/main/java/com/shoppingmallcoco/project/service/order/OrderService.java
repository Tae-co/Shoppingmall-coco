package com.shoppingmallcoco.project.service.order;

import com.shoppingmallcoco.project.dto.order.*;
import com.shoppingmallcoco.project.entity.auth.Member;
import com.shoppingmallcoco.project.entity.order.Order;
import com.shoppingmallcoco.project.entity.order.OrderItem;
import com.shoppingmallcoco.project.entity.product.ProductOptionEntity;
import com.shoppingmallcoco.project.repository.order.OrderRepository;
import com.shoppingmallcoco.project.repository.auth.MemberRepository;
import com.shoppingmallcoco.project.repository.product.ProductOptionRepository;

import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.exception.IamportResponseException;
import com.siot.IamportRestClient.request.CancelData;
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;
import java.io.IOException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final MemberRepository memberRepository;
    private final ProductOptionRepository productOptionRepository;
    private final IamportClient iamportClient;

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

        // [트랜잭션 시작] 결제 검증 및 주문 저장
        try {
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
                if (member.getPoint() < pointsToUse)
                    throw new RuntimeException("포인트 부족");
                if (pointsToUse > (totalOrderPrice + shippingFee))
                    throw new RuntimeException("결제 금액 초과 사용 불가");
                member.usePoints(pointsToUse);
            }

            long finalTotalPrice = totalOrderPrice + shippingFee - pointsToUse;

            // 1. PG사에 결제된 금액과 서버에서 계산한 금액이 일치하는지 검증
            // impUid가 null이 아닐 때만 검증 (PG 결제일 경우)
            if (requestDto.getImpUid() == null || requestDto.getImpUid().isEmpty()) {
                throw new RuntimeException("결제 고유 번호(impUid)가 누락되었습니다. 주문을 진행할 수 없습니다.");
            }
            validatePayment(requestDto.getImpUid(), finalTotalPrice); // 검증 실행

            // 2. 주문 엔티티 생성 및 DB 저장을 시도합니다.

            Order order = new Order();
            order.setMember(member);
            order.setOrderDate(LocalDate.now());
            order.setStatus("PAID");
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

        } catch (RuntimeException | IOException | IamportResponseException e) {
            // 3. 예외 발생 시: 보상 트랜잭션 (결제 취소)
            if (requestDto.getImpUid() != null) {
                cancelPayment(requestDto.getImpUid(), "주문 저장 실패/오류로 인한 자동 취소");
            }
            throw new RuntimeException("주문 처리 중 오류 발생: " + e.getMessage());
        }
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

        if (!"PAID".equals(order.getStatus())) {
            throw new RuntimeException("현재 상태[" + order.getStatus() + "]는 취소할 수 없습니다. (PAID 상태에서만 가능)");
        }

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

        // DB에 저장된 개별 상품 가격(orderPrice) * 수량(orderQty)의 총합 계산 (원가 기준)
        long totalItemPrice = order.getOrderItems().stream()
                .mapToLong(item -> item.getOrderPrice() * item.getOrderQty())
                .sum();

        long calculatedShippingFee = (totalItemPrice >= FREE_SHIPPING_THRESHOLD) ? 0 : SHIPPING_FEE;

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
                .pointsUsed(order.getPointsUsed())
                .shippingFee(calculatedShippingFee)
                .items(items)
                .build();
    }

    /**
     * 포트원 결제 금액 검증 로직
     * 서버에서 계산한 최종 금액과 PG사에 실제로 결제된 금액이 일치하는지 확인
     */
    private void validatePayment(String impUid, long serverCalculatedPrice)
            throws IamportResponseException, IOException {

        IamportResponse<Payment> iamportResponse = iamportClient.paymentByImpUid(impUid);

        // 1. 결제 상태 확인: 'paid'인지 확인
        if (!"paid".equals(iamportResponse.getResponse().getStatus())) {
            throw new RuntimeException("결제가 완료되지 않았습니다. (Status: " + iamportResponse.getResponse().getStatus() + ")");
        }

        // 2. 금액 검증
        long paidAmount = iamportResponse.getResponse().getAmount().longValue();

        if (paidAmount != serverCalculatedPrice) {
            cancelPayment(impUid, "결제 금액 불일치로 인한 자동 취소");
            throw new RuntimeException("결제 금액 불일치 (해킹 시도 의심)");
        }
    }

    /**
     * 포트원 결제 취소 요청 (보상 트랜잭션)
     */
    private void cancelPayment(String impUid, String reason) {
        try {
            CancelData cancelData = new CancelData(impUid, true); // 전액 취소
            cancelData.setReason(reason);
            iamportClient.cancelPaymentByImpUid(cancelData);
            log.info("결제 취소 완료: impUid={}, reason={}", impUid, reason);
        } catch (Exception e) {
            // 취소 실패 시 관리자에게 알림
            log.error("결제 취소 실패! 관리자 확인 필요. impUid={}, reason={}", impUid, reason, e);
        }
    }

}
