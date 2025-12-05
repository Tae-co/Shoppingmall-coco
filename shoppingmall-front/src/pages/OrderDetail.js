import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/OrderDetail.css";
import axios from "axios";

function OrderDetail() {
  const navigate = useNavigate();
  const { orderNo } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem("token");
  useEffect(() => {

    if (!orderNo || !token) return;
    axios
      .get(`http://localhost:8080/api/orders/${orderNo}`, {
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
  }, [orderNo, token]);

  if (loading) return <p className="loading-text">불러오는 중...</p>;
  if (!order) return <p className="empty-order">주문 정보를 찾을 수 없습니다.</p>;
  const originalSubtotal = order.items
    .reduce((total, item) => total + (item.originalPrice || item.price || 0) * (item.qty || 1), 0);

  // 백엔드에서 계산해서 보내준 배송비와 사용 포인트
  const shippingFee = order.shippingFee || 0;
  const pointsUsed = order.pointsUsed || 0;

  // 최종 결제 금액 (검증용 계산: 상품총액 + 배송비 - 포인트)
  const finalPaymentAmount = originalSubtotal + shippingFee - pointsUsed;

  // 주문 취소 핸들러
  const handleCancelOrder = async () => {
    if (window.confirm("정말로 주문을 취소하시겠습니까?")) {
      try {
        await axios.post(
          `http://localhost:8080/api/orders/${orderNo}/cancel`, // 백엔드 API 호출
          null,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("주문이 취소되었습니다.");
        // 취소 후 상태 변경을 반영하기 위해 페이지 새로고침
        window.location.reload();
      } catch (error) {
        const errorMessage = error.response?.data || "취소할 수 없는 상태이거나 오류가 발생했습니다.";
        alert(errorMessage);
      }
    }
  };


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

      <div className="order-top-row">
        <h2>{order.orderDate?.slice(0, 10).replace(/-/g, ".")}</h2>
        <span className="order-status">{order.status}</span>
      </div>

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

       {order.items.map((item, idx) => (
           <div key={idx} className="product-card">
          <img src={item.imageUrl} alt="" className="product-img"/>
          <div className="product-info">
            <p className="product-name">{item.productName}</p>
            <p className="product-detail">
              {item.price?.toLocaleString() || 0}원 / {item.qty}개
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
          <span>{Number(originalSubtotal).toLocaleString()}원</span>
        </div>

        <div className="price-row">
          <span>배송비</span>
          <span>{Number(shippingFee).toLocaleString()}원</span>
        </div>


        <div className="price-row">
          <span>포인트 사용</span>
          <span>-{Number(pointsUsed).toLocaleString()}원</span>
        </div>
        <div className="price-total">
          <strong>결제 금액</strong>
          <strong>
            {Number(finalPaymentAmount).toLocaleString()}원
          </strong>
        </div>
      </div>

      <button className="list-btn" onClick={() => navigate("/order-history")}>
        목록
      </button>

      {/*  주문 취소 버튼 (PAID 또는 PENDING 상태일 때만 표시)*/}
      {(order.status === "PAID" || order.status === "PENDING") && (
        <button
          className="list-btn cancel-btn" // 'cancel-btn' 클래스는 빨간색 스타일링용
          onClick={handleCancelOrder}
        >
          주문 취소
        </button>
      )}

    </div>
  );
}

export default OrderDetail;