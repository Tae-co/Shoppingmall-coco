import React from 'react';
import { Link,useLocation } from 'react-router-dom';
import '../../css/OrderResultPage.css'; // 주문 결과 페이지 공용 CSS 사용

// 전역 주문 상태(Context)를 관리하는 훅
import { useOrder } from '../OrderContext'; 

// 주문 성공 시 주문 완료 정보를 표시하고 다음 행동을 안내하는 컴포넌트
function OrderSuccessPage() {
  // 전역 '보관함'에서 주문 관련 금액 정보를 가져옵니다.
  const { orderSubtotal, shippingFee, pointsToUse } = useOrder();
  
  // 최종 결제 금액 계산: 상품 합계 + 배송비 - 사용 포인트
  const finalAmount = orderSubtotal + shippingFee - pointsToUse;
  
    const location = useLocation();
  
  // 주문 번호  (없으면 '정보 없음' 표시)
  const orderNumber = location.state?.orderNo || "정보 없음";
  
  // 현재 주문 일시를 포맷하여 생성 (예: 2025년 11월 5일 15:30)
  const now = new Date();
  const orderDate = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // 결제 방법 정의
  const paymentMethod = "API간편 결제";

  return (
    <div className="order-result-page">

      {/* 주문 성공을 시각적으로 나타내는 아이콘 영역 */}
      <div className="result-icon-wrapper">
        <div className="result-icon success">
          <span>✔</span>
        </div>
      </div>
      
      {/* 주문 완료 제목과 주문 번호 표시 */}
      <h1 className="result-title">주문이 완료되었습니다!</h1>
      <p className="result-subtitle">주문번호: {orderNumber}</p>

      {/* --- 주문 상세 정보 박스 --- */}
      <div className="result-box order-info-box">
        <h2>주문 정보</h2>
        {/* 주문 번호 표시 */}
        <div className="info-row">
          <span>주문 번호</span>
          <span>{orderNumber}</span>
        </div>
        {/* 주문 일시 표시 */}
        <div className="info-row">
          <span>주문 일시</span>
          <span>{orderDate}</span>
        </div>
        {/* 결제 방법 표시 */}
        <div className="info-row">
          <span>결제 방법</span>
          <span>{paymentMethod}</span>
        </div>
        {/* --- 결제 금액 정보 박스 --- */}
      <div className="result-box payment-info-box">
        <h2>결제 정보</h2>
        
        {/* 상품 금액 (원가 합계) 표시 */}
        <div className="info-row">
            <span>상품 금액</span>
            <span>₩{orderSubtotal.toLocaleString()}</span>
        </div>

        {/*  배송비 표시 */}
        <div className="info-row">
            <span>배송비</span>
            <span>₩{shippingFee.toLocaleString()}</span>
        </div>
        
        {/* 포인트 사용량 표시 */}
        <div className="info-row">
            <span>포인트 사용</span>
            {/* 포인트는 차감되므로 마이너스 부호를 붙여줍니다. */}
            <span>- ₩{pointsToUse.toLocaleString()}</span> 
        </div>

        {/* 최종 결제 금액 (finalAmount 변수 사용) */}
        <div className="info-total">
          <span>총 결제 금액</span>
          <span className="info-total-amount">₩{finalAmount.toLocaleString()}</span>
        </div>
      </div>
      </div>

      {/* --- 다음 단계 안내 박스 --- */}
      <div className="result-box next-steps-box">
        <h2>다음 단계</h2>
        {/* 상품 준비 단계 안내 */}
        <div className="step-row">
          <span className="step-row-icon">📦</span>
          <div className="step-row-text">
            <h3>상품 준비</h3>
            <p>주문하신 상품을 준비하고 있습니다. (1-2 영업일)</p>
          </div>
        </div>
        {/* 배송 시작 단계 안내 */}
        <div className="step-row">
          <span className="step-row-icon">🚚</span>
          <div className="step-row-text">
            <h3>배송 시작</h3>
            <p>상품이 발송되면 SMS/이메일로 송장번호를 보내드립니다.</p>
          </div>
        </div>
        {/* 배송 완료 및 리뷰 안내 */}
        <div className="step-row">
          <span className="step-row-icon">✍️</span>
          <div className="step-row-text">
            <h3>배송 완료</h3>
            <p>상품 수령 후 리뷰를 남겨주시면 포인트를 드립니다.</p>
          </div>
        </div>
      </div>

      {/* 사용자가 다음 행동을 선택할 수 있는 버튼 그룹 */}
      <div className="result-buttons">
        {/* 주문 내역 페이지로 이동하는 주 버튼 */}
        <Link to="/mypage" className="btn-primary-dark">주문 내역 보기</Link>
        {/* 메인 페이지로 돌아가는 보조 버튼 */}
        <Link to="/" className="btn-secondary-light">쇼핑 계속하기</Link>
      </div>

    </div>
  );
}

export default OrderSuccessPage;