import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/OrderDetail.css";
import axios from "axios";

function OrderDetail() {
  const navigate = useNavigate();
  const { orderNo } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!orderNo || !token) return;

    axios
      .get(`http://localhost:8080/api/coco/orders/${orderNo}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        setOrder(res.data);
      })
      .catch((err) => {
        console.error("주문 상세 조회 실패:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderNo]);

  if (loading) return <p className="loading-text">불러오는 중...</p>;
  if (!order) return <p className="empty-order">주문 정보를 찾을 수 없습니다.</p>;

return (
  <div className="order-detail-container">

      {/* 뒤로가기 */}
      <button className="back-btn" onClick={() => navigate("/mypage")}>
        <svg
          className="arrow-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>주문내역으로 돌아가기</span>
      </button>

    {/* 상단 주문 정보 */}
    <div className="order-header">
      <h2>{order.orderDate?.slice(0, 10).replace(/-/g, ".")}</h2>
      <p className="order-no">주문번호 {order.orderNo}</p>
    </div>

    {/* 배송지 정보 */}
    <div className="section-box">
      <h3>수령인</h3>
      <p><strong>{order.recipientName}</strong></p>
      <p>{order.recipientPhone}</p>
      <p>{order.orderAddress1} {order.orderAddress2}</p>
      {order.deliveryMessage && (
        <p className="delivery-msg">{order.deliveryMessage}</p>
      )}
    </div>

    {/* 상품 목록 */}
    <div className="section-box">
      <h3>주문 상품 {order.items.length}개</h3>

      {order.items.map((item) => (
        <div key={item.orderItemNo} className="product-card">
          <img src={item.imageUrl} alt="" className="product-img"/>
          <div className="product-info">
            <p className="product-name">{item.productName}</p>
            <p className="product-detail">
              {item.price.toLocaleString()}원 / {item.qty}개
            </p>
            </div>
            {order.status === "배송완료" && (
              <button
                className="review-btn"
                onClick={() => navigate(`/write-review/${item.orderItemNo}`)}
              >
                리뷰쓰기 ✎
              </button>
            )}
          </div>
      ))}

      {order.status === "배송완료" && (
        <div className="status-actions">
          <button className="action-btn">반품 요청</button>
          <button className="action-btn">교환 요청</button>
          <button className="action-btn">배송 조회</button>
        </div>
      )}
    </div>

    {/* 결제 정보 */}
    <div className="section-box">
      <h3>결제 정보</h3>

      <div className="price-row">
        <span>상품 금액</span>
        <span>{order.totalPrice.toLocaleString()}원</span>
      </div>

      {order.pointsUsed > 0 && (
        <div className="price-row">
          <span>적립금 사용</span>
          <span>-{order.pointsUsed.toLocaleString()}원</span>
        </div>
      )}

      <div className="price-total">
        <strong>결제 금액</strong>
        <strong>{(order.totalPrice - (order.pointsUsed || 0)).toLocaleString()}원</strong>
      </div>
    </div>

    <button className="list-btn" onClick={() => navigate("/order-history")}>
      목록
    </button>
  </div>
);
}

export default OrderDetail;