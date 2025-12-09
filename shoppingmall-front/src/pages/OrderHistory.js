import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/OrderHistory.css";
import axios from "axios";

function OrderHistory() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);

  const statusMap = {
    배송완료: "배송완료",
    배송중: "배송중",
    상품준비중: "상품준비중",
    취소됨: "취소됨",
  };

    useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    axios
      .get(`http://13.231.28.89:18080/api/orders/my`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        setOrders(res.data);    
        setTotalPages(1);        
      })
      .catch((err) => {
        console.error("주문 내역 조회 실패:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, period]);

  return (
    <div className="order-history-container">
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
        <span>마이페이지로 돌아가기</span>
      </button>

      <h2 className="page-title">주문 내역</h2>

      {/* 기간 필터 */}
      <div className="period-filter">
        <button
          onClick={() => {
            setPage(0);
            setPeriod("3m");
          }}
          className={period === "3m" ? "active" : ""}
        >
          3개월
        </button>

        <button
          onClick={() => {
            setPage(0);
            setPeriod("6m");
          }}
          className={period === "6m" ? "active" : ""}
        >
          6개월
        </button>

        <button
          onClick={() => {
            setPage(0);
            setPeriod("1y");
          }}
          className={period === "1y" ? "active" : ""}
        >
          1년
        </button>

        <button
          onClick={() => {
            setPage(0);
            setPeriod("all");
          }}
          className={period === "all" ? "active" : ""}
        >
          전체
        </button>
      </div>

      {/* 로딩 표시 */}
      {loading && <p className="loading-text">불러오는 중...</p>}

      {/* 주문 없음 표시 */}
      {!loading && orders.length === 0 && (
        <p className="empty-order">주문 내역이 없습니다.</p>
      )}

      {/* 주문 카드 렌더링 */}
      {orders.map((order) => (
        <div key={order.orderNo} className="order-card">
          {/* 상단 영역 */}
          <div className="order-top">
            <div>
              <span className="order-date">
                {order.orderDate?.slice(0, 10)}
              </span>
              <span className="order-no">주문번호: {order.orderNo}</span>
            </div>
            <span className={`order-status`}>
              {statusMap[order.status] || order.status}
            </span>
          </div>

          <hr className="divider" />

          {/* 상품 목록 */}
          <div className="order-items">
            {order.items.map((item, idx) => (
                 <div key={idx} className="order-item">

                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="item-img"
                />

                <div className="item-info">
                  <p className="item-name">{item.productName}</p>
                  <p className="item-detail">
                    {item.price?.toLocaleString() || 0}원 / {item.qty}개
                  </p>
                </div>
                
                  {/*개별 리뷰쓰기 버튼 */}
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
            </div>

            <hr className="divider" />

            {/* 하단 */}
              <div className="order-bottom">
              <div className="order-total">
                <span>총 주문금액</span>
                <strong>{order.totalPrice.toLocaleString()}원</strong>

                <button
                 className="detail-btn"
                 onClick={() => navigate(`/order-detail/${order.orderNo}`)}
               >
                 상세보기 ›
                </button>
              </div>
            </div>
          </div>
            ))}

            {/* 페이지네이션 */}
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, idx) => (
                  <button
                  key={idx}
                    className={page === idx ? "active-page" : ""}
                    onClick={() => setPage(idx)}
                  >
                    {idx + 1}
                  </button>
            ))}
      </div>
    </div>
  );
}

export default OrderHistory;