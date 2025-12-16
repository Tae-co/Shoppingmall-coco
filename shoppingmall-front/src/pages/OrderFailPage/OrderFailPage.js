import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../css/OrderResultPage.css'; // 주문 성공/실패 페이지 공용 CSS 사용

// 주문 실패를 사용자에게 안내하고 해결 방법을 제공하는 컴포넌트
function OrderFailPage() {
  const location = useLocation();

  // PaymentPage에서 전달받은 실패 메시지 (없으면 기본값 사용)
  const failMessage = location.state?.failMessage || "결제 승인 과정에서 오류가 발생했습니다.";
 

  return (
    <div className="order-result-page">

      {/* 실패 상태를 시각적으로 나타내는 아이콘 영역 */}
      <div className="result-icon-wrapper">
        <div className="result-icon fail">
          <span>!</span>
        </div>
      </div>
      
      {/* 실패 제목과 부제목 */}
      <h1 className="result-title">주문 처리 실패</h1>
      <p className="result-subtitle">결제가 거부되었습니다</p>

      {/* 결제 거부 원인을 간략히 설명하는 경고 알림 박스 */}
      <div className="error-alert-box">
        <span className="icon">⚠️</span>
        <div>
          <strong>{failMessage}</strong>
        </div>
      </div>

      {/* 실패 시 사용자가 취할 수 있는 해결 방법을 안내하는 박스 */}
      <div className="result-box solution-box">
        <h2>해결 방법</h2>
        <ul className="solution-list">
          <li className="solution-item">
            <span className="number">1</span>
            <span>카드 한도를 확인해주세요</span>
          </li>
          <li className="solution-item">
            <span className="number">2</span>
            <span>카드 정보가 정확한지 확인해주세요</span>
          </li>
          <li className="solution-item">
            <span className="number">3</span>
            <span>다른 결제 수단을 사용해보세요</span>
          </li>
          <li className="solution-item">
            <span className="number">4</span>
            <span>카드사에 문의하여 거부 사유를 확인해주세요</span>
          </li>
        </ul>
      </div>

      {/* 문제 지속 시 연락할 고객센터 정보를 제공하는 박스 */}
      <div className="support-box">
        <span className="icon">📞</span>
        <div>
          <h3>도움이 필요하신가요?</h3>
          <p>
            문제가 계속되거나 도움이 필요하시면 고객센터로 연락주세요.<br />
            고객센터: <strong>1588-1234</strong> (평일 09:00 - 18:00)<br />
            이메일: <strong>support@coco.com</strong>
          </p>
        </div>
      </div>

      {/* 주문 실패 관련 추가 정보를 알리는 알림 박스 */}
      <div className="notification-box" style={{ marginTop: '20px' }}>
        <p>
          <strong>알림:</strong> 결제가 실패했지만 장바구니는 그대로 유지됩니다.
          중복 결제가 우려되시면 카드사에 결제 내역을 확인하시기 바랍니다.
        </p>
      </div>

      {/* 사용자가 다음 행동을 선택할 수 있는 버튼 그룹 */}
      <div className="result-buttons">
        {/* 결제 재시도 버튼 (PaymentPage로 이동) */}
        <Link to="/payment" className="btn-primary-blue">다시 시도하기</Link>
        
        {/* 장바구니로 돌아가는 버튼 */}
        <Link to="/cart" className="btn-secondary-light">
          장바구니로 돌아가기
        </Link>
      </div>

    </div>
  );
}

export default OrderFailPage;