import React, { useEffect, useState } from "react";
import "../css/MyPage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getStoredMember, getCurrentMember } from "../utils/api";

function MyPage() {
  const navigate = useNavigate();

    // 관리자 체크 - 관리자는 관리자 페이지로 리다이렉트
  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        // 백엔드에서 최신 회원 정보 가져오기
        const memberData = await getCurrentMember();
        const userRole = memberData.role || '';
        if (userRole === 'ADMIN' || userRole === 'admin') {
          navigate('/admin', { replace: true });
        }
      } catch (error) {
        // 백엔드 호출 실패 시 localStorage에서 가져오기
        console.error('회원 정보 조회 실패:', error);
        const memberData = getStoredMember();
        const userRole = memberData.role || '';
        if (userRole === 'ADMIN' || userRole === 'admin') {
          navigate('/admin', { replace: true });
        }
      }
    };

    checkAdminRole();
  }, [navigate]);

  const [myPageData, setMyPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  // JWT 토큰 (로그인 시 localStorage 저장)
  const token = localStorage.getItem("token");

  // 메뉴 데이터
  const menuItems = [
    { icon: "👤", title: "프로필 설정", desc: "피부 프로필 및 회원 정보 수정", path: "/profile-edit" },
    { icon: "📦", title: "주문 내역", desc: "구매한 상품 및 배송 현황 조회", path: "/order-history" },
    { icon: "💬", title: "내 리뷰", desc: "작성한 리뷰 및 좋아요한 리뷰", path: "/my-activity" },
    { icon: "🤝", title: "Co-mates", desc: "나와 비슷한 피부톤/타입 사용자들", path: "/my-comate" },
    { icon: "⚙️", title: "계정 설정", desc: "비밀번호 변경 및 계정 관리", path: "/account-settings" },
  ];

  // 마이페이지 데이터 불러오기
  useEffect(() => {
    if (!token) return; // 토큰 없으면 요청x

    axios
      .get("http://localhost:8080/api/mypage", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setMyPageData(res.data);
      })
      .catch((err) => {
        console.error("마이페이지 불러오기 오류:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]); // token 변경 시 다시 요청

  if (loading) return <div>로딩 중...</div>;
  if (!myPageData) return <div>데이터를 불러오지 못했습니다.</div>;

  const { nickname, point, recentOrders } = myPageData;

  return (
    <div className="mypage-container">
      {/* 상단 헤더 */}
      <div className="mypage-header">
        <h2>마이페이지</h2>
        <p>나만의 뷰티 공간</p>
      </div>

      {/* 사용자 정보 */}
      <div className="mypage-user">
        <div className="user-info">
          <div className="user-avatar">{nickname?.charAt(0)}</div>
          <div>
            <h3>{nickname}</h3>
            <p>로그인한 계정</p>
          </div>
        </div>
        <div className="user-stats">
          <strong>{point?.toLocaleString()}</strong>
          <p>포인트</p>
        </div>
      </div>

      {/* 메뉴 섹션 */}
      <div className="mypage-menu">
        {menuItems.map((item) => (
          <div
            className="menu-item"
            key={item.title}
            onClick={() => item.path && navigate(item.path)}
          >
            <span className="menu-icon">{item.icon}</span>
            <div className="menu-text">
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
            <span className="menu-arrow">›</span>
          </div>
        ))}
      </div>

      {/* 최근 주문 */}
      <div className="mypage-orders">
        <div className="orders-header">
          <h4>최근 주문</h4>
          <button
            className="view-all-btn"
            onClick={() => navigate("/order-history")}
          >
            전체보기 ›
          </button>
        </div>

        {recentOrders.length > 0 ? (
          <div className="recent-orders-list">
            {recentOrders.map((order) => (
              <div
                key={order.orderNo}
                className="recent-order-item"
                onClick={() => navigate(`/order-detail/${order.orderNo}`)}
              >
                {/* 이미지 영역 */}
                <div className="order-image-box">
                  <img
                    src={order.thumbnailImage}
                    alt={order.mainProductName}
                    className="order-thumbnail"
                  />
                </div>

                {/* 내용 영역 */}
                <div className="order-content">
                  <p className="order-date">
                    {order.orderDate} <span>주문번호: {order.orderNo}</span>
                  </p>

                  <p className="order-title">
                    {order.mainProductName}
                    {order.extraItemCount > 0 && (
                      <span className="extra-count">
                        {" "}외 {order.extraItemCount}건
                      </span>
                    )}
                  </p>

                  <p className="order-price">
                    {order.totalPrice.toLocaleString()}원
                  </p>
                </div>

                <div className="order-right">
                  <span
                    className={`status-badge ${
                      order.status === "배송완료" ? "complete" : "shipping"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="arrow">›</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-orders">최근 주문이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default MyPage;
