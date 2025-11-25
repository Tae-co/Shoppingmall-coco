import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/OrderHistory.css";

function OrderHistory() {
  const navigate = useNavigate();

  const orders = [
    {
      id: "ORD-001",
      date: "2024.10.28",
      status: "배송완료",
      total: 45000,
      items: [
        {
          name: "히알루론산 인텐시브 세럼",
          price: 45000,
          qty: 1,
          img: "/images/serum.jpg",
        },
      ],
      extraItems: 0,
    },
    {
      id: "ORD-002",
      date: "2024.10.15",
      status: "배송중",
      total: 91000,
      items: [
        {
          name: "비타민C 브라이트닝 토너",
          price: 32000,
          qty: 1,
          img: "/images/toner.jpg",
        },
        {
          name: "센텔라 진정 크림",
          price: 28000,
          qty: 2,
          img: "/images/cream.jpg",
        },
      ],
      extraItems: 1,
    },
  ];

  return (
    <div className="order-history-container">
      <button className="back-btn" onClick={() => navigate("/mypage")}>
        ← 마이페이지로 돌아가기
      </button>
      <h2 className="page-title">주문 내역</h2>

      {orders.map((order) => (
        <div key={order.id} className="order-card">
          {/* 상단 영역 */}
          <div className="order-top">
            <div>
              <span className="order-date">{order.date}</span>
              <span className="order-no">주문번호: {order.id}</span>
            </div>
            <span className={`order-status ${order.status}`}>
              {order.status}
            </span>
          </div>

          <hr className="divider" />

          {/* 상품 목록 */}
          <div className="order-items">
            {order.items.map((item, idx) => (
              <div key={idx} className="order-item">
                <img src={item.img} alt={item.name} className="item-img" />
                <div className="item-info">
                  <p className="item-name">{item.name}</p>
                  <p className="item-detail">
                    {item.price.toLocaleString()}원 × {item.qty}개
                  </p>
                </div>
              </div>
            ))}
            {order.extraItems > 0 && (
              <p className="extra-items">외 {order.extraItems}개 상품</p>
            )}
          </div>

          <hr className="divider" />

          {/* 하단 영역: 총금액 + 버튼들 */}
          <div className="order-bottom">
            <div className="order-total">
              <span>총 주문금액</span>
              <strong>{order.total.toLocaleString()}원</strong>

              {/* 상세보기 버튼 */}
              <button
                className="detail-btn"
                onClick={() => navigate(`/order-detail/${order.id}`)}
              >
                상세보기 ›
              </button>

              {/* 리뷰쓰기 버튼 (배송완료일 때만 표시) */}
              {order.status === "배송완료" && (
                <button
                  className="review-btn"
                  onClick={() => navigate(`/write-review/${order.id}`)}
                >
                  리뷰쓰기 ✎
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OrderHistory;