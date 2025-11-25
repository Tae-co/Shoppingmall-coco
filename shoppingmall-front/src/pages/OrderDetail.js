import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/OrderDetail.css";

function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); // /order-detail/:id

  // URL id → "ORD-001" 형태로 변환
  const orderKey = `ORD-${String(id).padStart(3, "0")}`;

  // 더미데이터
  const orderData = {
    "ORD-001": {
      id: "ORD-001",
      date: "2024.10.28",
      status: "배송완료",
      expected: "2024.10.30",
      products: [
        {
          name: "히알루론산 인텐시브 세럼",
          price: 45000,
          qty: 1,
          total: 45000,
          img: "/images/serum.jpg",
        },
      ],
      receiver: {
        name: "김미영",
        phone: "010-****-5678",
        address: "서울특별시 강서구 화곡동 1234 코코아파트 101동 1004호",
        zip: "45678",
      },
      payment: {
        orderTotal: 45000,
        coupon: 0,
        point: 0,
        final: 45000,
        method: "네이버페이(Npay)",
      },
    },

    "ORD-002": {
      id: "ORD-002",
      date: "2024.10.15",
      status: "배송중",
      expected: "2024.10.20",
      products: [
        {
          name: "비타민C 브라이트닝 토너",
          price: 32000,
          qty: 1,
          total: 32000,
          img: "/images/toner.jpg",
        },
        {
          name: "센텔라 진정 크림",
          price: 28000,
          qty: 2,
          total: 56000,
          img: "/images/cream.jpg",
        },
        {
          name: "센텔라 마스크팩",
          price: 1500,
          qty: 2,
          total: 3000,
          img: "/images/mask.jpg",
        },
      ],
      receiver: {
        name: "김민수",
        phone: "010-****-5789",
        address: "부산광역시 해운대구 코코아파트 202동 1004호",
        zip: "78945",
      },
      payment: {
        orderTotal: 91000,
        point: 0,
        final: 91000,
        method: "신용카드",
      },
    },
  };

  const order = orderData[orderKey];

  if (!order) return <div>주문 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="order-detail-container">
      <button className="back-btn" onClick={() => navigate("/order-history")}>
        ← 주문 내역으로 돌아가기
      </button>

      <h2 className="page-title">주문 상세 정보</h2>

      {/* 주문 기본 정보 */}
      <div className="order-summary">
        <p>주문일자: {order.date}</p>
        <p>주문번호: {order.id}</p>
      </div>

      {/* 상품 목록 */}
      <div className="product-list">
        <h3>주문 상품</h3>
        {order.products.map((p, idx) => (
          <div className="product-item" key={idx}>
            <img src={p.img} alt={p.name} className="product-img" />
            <div className="product-info">
              <p className="product-name">{p.name}</p>
              <p className="product-detail">
                {p.price.toLocaleString()}원 × {p.qty}개
              </p>
              <p className="product-total">{p.total.toLocaleString()}원</p>
            </div>
          </div>
        ))}
      </div>

      {/* 배송지 정보 */}
      <div className="shipping-info">
        <h3>배송지 정보</h3>
        <p>
          <strong>받는 분:</strong> {order.receiver.name}
        </p>
        <p>
          <strong>연락처:</strong> {order.receiver.phone}
        </p>
        <p>
          <strong>주소:</strong> [{order.receiver.zip}] {order.receiver.address}
        </p>
      </div>

      {/* 결제 정보 */}
      <div className="payment-info">
        <h3>결제 정보</h3>
        <div className="payment-row">
          <span>주문금액</span>
          <span>{order.payment.orderTotal.toLocaleString()}원</span>
        </div>
        <div className="payment-row">
          <span>포인트 사용</span>
          <span>-{order.payment.point.toLocaleString()}원</span>
        </div>
        <div className="payment-total">
          <strong>총 결제금액</strong>
          <strong>{order.payment.final.toLocaleString()}원</strong>
        </div>
        <p className="payment-method">결제수단: {order.payment.method}</p>
      </div>

      <button className="list-btn" onClick={() => navigate("/order-history")}>
        목록
      </button>
    </div>
  );
}

export default OrderDetail;