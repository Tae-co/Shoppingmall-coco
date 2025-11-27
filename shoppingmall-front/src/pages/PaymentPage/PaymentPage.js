import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/PaymentPage.css';
import { useOrder } from '../OrderContext'; // 전역 주문 상태(Context) 훅
import TermsPopup from './TermsPopup'; // 약관 상세 보기 팝업 컴포넌트
import axios from 'axios';

// 결제 수단 선택, 포인트 사용, 약관 동의 및 최종 결제를 처리하는 페이지 컴포넌트 (주문 프로세스 3단계)
function PaymentPage() {
  const navigate = useNavigate();

  // OrderContext에서 배송지 정보(lastName, phone 등)까지 모두 가져옴
  const {
    orderSubtotal, // 상품 총액
    shippingFee,   // 배송비
    userPoints,    // 사용자 보유 포인트
    pointsToUse, setPointsToUse, // 사용할 포인트 상태
    lastName, firstName, phone, postcode, address, addressDetail, deliveryMessage // 배송지 정보
  } = useOrder();

  // 로컬 상태 관리: 결제 수단, 약관 동의, 약관 팝업 표시 여부
  const [paymentMethod, setPaymentMethod] = useState('api'); // 'api' 또는 'card'
  const [agreements, setAgreements] = useState({
    purchase: false, // 구매 조건 동의
    info: false      // 개인정보 처리 동의
  });
  const [isTermsPopupOpen, setIsTermsPopupOpen] = useState(false);

  // 카드 정보 직접 입력을 위한 로컬 상태
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // 약관 팝업 열기/닫기 핸들러
  const handleOpenTermsPopup = () => setIsTermsPopupOpen(true);
  const handleCloseTermsPopup = () => setIsTermsPopupOpen(false);

  // 금액 계산: 총 주문 금액과 최종 결제 금액
  const totalAmount = orderSubtotal + shippingFee;
  const finalAmount = totalAmount - pointsToUse;

  // 포인트 입력 필드 변경 핸들러
  const handlePointsChange = (e) => {
    let value = Number(e.target.value);
    if (value < 0) value = 0;
    if (value > userPoints) value = userPoints;       // 보유 포인트 초과 방지
    if (value > totalAmount) value = totalAmount;     // 결제 금액 초과 방지
    setPointsToUse(value);
  };

  // '모두 사용' 버튼 핸들러
  const handleUseAllPoints = () => {
    // 사용할 수 있는 최대 포인트 (보유 포인트와 결제 금액 중 작은 값)
    const maxUsablePoints = Math.min(userPoints, totalAmount);
    setPointsToUse(maxUsablePoints);
  };

  // 약관 동의 체크박스 변경 핸들러
  const handleAgreementChange = (e) => {
    const { name, checked } = e.target;
    setAgreements(prev => ({ ...prev, [name]: checked }));
  };


  // '결제하기' 버튼 클릭 시 최종 유효성 검사 및 '진짜' 결제 처리
  const handlePaymentSubmit = () => {
    // 1. 필수 약관 동의 검사
    if (!agreements.purchase || !agreements.info) {
      alert("필수 약관에 모두 동의해주세요.");
      return;
    }

    if (paymentMethod === 'api') {
      // 2-1. 'API 간편결제'일 경우: '포트원' 실제 결제 로직
      
      const { IMP } = window; // index.html에서 로드한 IMP 객체
      IMP.init("iamport"); // 테스트용 가맹점 식별코드

      // 결제 요청 데이터 정의
      const data = {
        pg: "kakaopay", // PG사 (예: 카카오페이)
        pay_method: "card", // 결제 방식
        merchant_uid: `coco_order_${new Date().getTime()}`, // 고유한 주문번호
        name: "Coco 뷰티 상품 외 1건", // 주문명
        amount: finalAmount, // ★★★ 실제 최종 결제 금액 ★★★
        buyer_name: `${lastName}${firstName}`, // 구매자 이름
        buyer_tel: phone,                      // 구매자 연락처
        buyer_addr: `${address} ${addressDetail}`, // 구매자 주소
        buyer_postcode: postcode,               // 구매자 우편번호
      };

      // 포트원 결제 창 호출
      IMP.request_pay(data, (rsp) => {
        if (rsp.success) {
          // --- 결제 성공 ---
          console.log("결제 성공:", rsp);

         
          const orderData = {
            orderItems: [
              { 
                prdNo: 1,       // (임시) 1번 상품
                optionNo: 1,    // (임시) 1번 옵션
                orderQty: 2     // (임시) 2개 주문
              } 
            ],
            // 배송지 정보
            recipientName: lastName + firstName, 
            recipientPhone: phone,
            orderZipcode: postcode,
            orderAddress1: address,
            orderAddress2: addressDetail,
            deliveryMessage: deliveryMessage || "조심해서 배송해 주세요.",
            pointsUsed: pointsToUse
          };

          // 토큰 가져오기
          const token = localStorage.getItem('token');

          //  Axios로 백엔드 API 호출 (헤더에 토큰 포함)
          axios.post('http://localhost:8080/api/orders', orderData, {
            headers: {
              'Authorization': `Bearer ${token}`, 
              'Content-Type': 'application/json'
            }
          })
            .then((response) => {
              // 백엔드가 보내준 진짜 주문 번호 받기
              const realOrderNo = response.data; 
              console.log("백엔드 저장 성공. 주문번호:", realOrderNo);

              alert("주문이 성공적으로 완료되었습니다!");
              
              //  성공 페이지로 이동하며 주문 번호를 state로 전달
              navigate('/order-success', { state: { orderNo: realOrderNo } }); 
            })
            .catch((error) => {
              console.error("백엔드 저장 실패:", error);
              
              // (403 에러 처리: 토큰 만료 등)
              if (error.response && error.response.status === 403) {
                alert("로그인 정보가 만료되었습니다. 다시 로그인해주세요.");
                // navigate('/login');
              } else {
                alert("주문 저장 실패: " + (error.response?.data || "서버 오류"));
              }
            });

        } else {
          // --- 결제 실패 ---
          console.log("결제 실패:", rsp.error_msg);
          alert(`결제에 실패하였습니다. 에러 내용: ${rsp.error_msg}`);
          navigate('/order-fail'); 
        }
      });

    } else if (paymentMethod === 'card') {
      // 2-2. '신용/체크카드' 직접 입력일 경우
      
      if (!cardNumber || !cardName || !cardExpiry || !cardCvc) {
        alert("카드 정보를 모두 입력해주세요.");
        return;
      }

      console.log("현재 '신용/체크카드 직접 입력'은 지원하지 않습니다. 실패 처리합니다.");
      navigate('/order-fail'); 
    }
  };

  return (
    <div className="payment-page">
      
      
      <h1>주문하기</h1>

      <div className="payment-content-wrapper">
        {/* --- 왼쪽: 결제 상세 입력 영역 --- */}
        <div className="payment-details">
          <h2>결제 수단 선택</h2>
          <div className="payment-method-options">
            {/* API 간편결제 선택 옵션 */}
            <div 
              className={`method-option ${paymentMethod === 'api' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('api')}
            >
              <span className="radio-icon"></span> API 간편결제 (포트원/토스 등)
            </div>
            {/* 신용/체크카드 직접 입력 선택 옵션 */}
            <div 
              className={`method-option ${paymentMethod === 'card' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              <span className="radio-icon"></span> 신용/체크카드 직접 입력
            </div>
          </div>

          {/* 결제 수단이 'card'일 때만 카드 정보 입력 폼 표시 */}
          {paymentMethod === 'card' && (
            <div className="card-info-section">
              <h2>카드 정보</h2>
              <form className="card-form">
                <div className="form-group">
                  <label htmlFor="card-number">카드 번호</label>
                  <input 
                    type="text" 
                    id="card-number" 
                    placeholder="1234 5678 9012 3456" 
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="card-name">카드 소유자명</label>
                  <input 
                    type="text" 
                    id="card-name" 
                    placeholder="HONG GIL DONG" 
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>
                {/* 만료일 및 CVC를 한 줄에 표시 */}
                <div className="form-group-half">
                  <div className="form-group">
                    <label htmlFor="card-expiry">만료일</label>
                    <input 
                      type="text" 
                      id="card-expiry" 
                      placeholder="MM/YY" 
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="card-cvc">CVC</label>
                    <input 
                      type="text" 
                      id="card-cvc" 
                      placeholder="123" 
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                    />
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* --- 포인트 사용 폼 --- */}
          <div className="points-section">
            <h2>포인트 사용</h2>
            <div className="points-form form-group-with-button">
              {/* 사용할 포인트 입력 필드 */}
              <input 
                type="number" 
                placeholder="0"
                value={pointsToUse || ''} 
                onChange={handlePointsChange}
              />
              {/* 포인트 모두 사용 버튼 */}
              <button type="button" className="btn-outline" onClick={handleUseAllPoints}>
                모두 사용
              </button>
            </div>
            <p className="points-info">보유 포인트: {userPoints.toLocaleString()} P</p>
          </div>
          
          {/* --- 약관 동의 섹션 --- */}
          <div className="agreement-section">
            <div className="agreement-item">
              <input 
                type="checkbox" 
                id="agree-purchase" 
                name="purchase"
                checked={agreements.purchase}
                onChange={handleAgreementChange}
              />
              <label htmlFor="agree-purchase">구매조건 및 결제대행 서비스 약관 동의 (필수)</label>
            </div>
            <div className="agreement-item">
              <input 
                type="checkbox" 
                id="agree-info" 
                name="info"
                checked={agreements.info}
                onChange={handleAgreementChange}
              />
              <label htmlFor="agree-info">개인정보 제공 및 처리 동의 (필수)</label>
            </div>
            {/* 약관 상세 팝업 열기 링크 */}
            <span className="agreement-link" onClick={handleOpenTermsPopup}>
              약관 보기
            </span>
          </div>
        </div>

        {/* --- 오른쪽: 주문 요약 및 결제 버튼 --- */}
        <div className="order-summary-sidebar">
          <div className="summary-box">
            <h3>최종 결제 금액</h3>
            {/* 금액 상세 */}
            <div className="summary-row">
              <span>상품 금액</span>
              <span>₩{orderSubtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>배송비</span>
              <span>₩{shippingFee.toLocaleString()}</span>
            </div>
            
            {/* 포인트 사용 시에만 표시 */}
            {pointsToUse > 0 && (
              <div className="summary-row discount">
                <span>포인트 사용</span>
                <span>- ₩{pointsToUse.toLocaleString()}</span>
              </div>
            )}
            
            {/* 총 결제 금액 */}
            <div className="summary-total">
              <span>총 결제 금액</span>
              <span>₩{finalAmount.toLocaleString()}</span>
            </div>
            
            {/* 최종 결제 버튼 (결제 유효성 검사 실행) */}
            <button 
              type="button" 
              className="btn-primary"
              onClick={handlePaymentSubmit}
            >
              ₩{finalAmount.toLocaleString()} 결제하기
            </button>
            {/* 이전 단계 버튼 (배송 정보 페이지로 이동) */}
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/order')}
            >
              이전 단계
            </button>
            {/* 주문 관련 유의 사항 */}
            <p className="summary-note">
              주문 완료 후 주문 취소/변경이 어려울 수 있습니다.
              주문 내용을 다시 한 번 확인해주세요.
            </p>
          </div>
        </div>
      </div>

      {/* --- 약관 팝업 렌더링 --- */}
      {isTermsPopupOpen && <TermsPopup onClose={handleCloseTermsPopup} />}
    </div>
  );
}

export default PaymentPage;