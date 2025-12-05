import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../css/OrderPage.css';
import { useOrder } from '../OrderContext';
import axios from 'axios';

// 주문자가 배송 정보를 입력하는 페이지 컴포넌트 (주문 프로세스 2단계)
function OrderPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 전역 주문 상태(OrderContext)에서 배송지 정보 state와 계산된 값을 가져옵니다.
  const {
    lastName, setLastName,
    firstName, setFirstName,
    phone, setPhone,
    postcode, setPostcode,
    address, setAddress,
    addressDetail, setAddressDetail,
    deliveryMessage, setDeliveryMessage,
    shippingFee,
    orderSubtotal,  // 상품 합계 금액 (배송비 계산에 사용)
    setOrderSubtotal, // 상품 합계 금액
    setShippingFee,   // 배송비
    setOrderItems,     // 주문 상품 목록
    setPointsToUse
  } = useOrder();

  //  페이지 진입 시 이전에 입력했던 배송지 및 포인트 정보 초기화
  useEffect(() => {
    setLastName('');
    setFirstName('');
    setPhone('');
    setPostcode('');
    setAddress('');
    setAddressDetail('');
    setDeliveryMessage('');

    // 결제 페이지에서 입력했던 포인트도 초기화
    if (setPointsToUse) setPointsToUse(0);
  }, [
    setLastName, 
    setFirstName, 
    setPhone, 
    setPostcode, 
    setAddress, 
    setAddressDetail, 
    setDeliveryMessage, 
    setPointsToUse
  ]); // 빈 배열: 컴포넌트가 처음 나타날 때 한 번만 실행

  //  장바구니 데이터 수신 및 Context 저장 
  useEffect(() => {
    if (location.state) {
      const { orderItems, orderSubtotal, shippingFee } = location.state;

      if (orderItems && setOrderItems) {
        setOrderItems(orderItems);
      }
      if (orderSubtotal && setOrderSubtotal) {
        setOrderSubtotal(orderSubtotal);
      }
      if (shippingFee && setShippingFee) {
        setShippingFee(shippingFee);
      }
    }

  }, [location.state, setOrderItems, setOrderSubtotal, setShippingFee]);

  // Daum Postcode API 스크립트 로드 여부 확인
  useEffect(() => {
    // window.daum 객체와 Postcode 함수가 있는지 확인하여 스크립트 오류를 방지합니다.
    if (!window.daum || !window.daum.Postcode) {
      console.error("Daum Postcode API 스크립트가 로드되지 않았습니다.");
    }
  }, []); // 컴포넌트 마운트 시 한 번만 실행


  // 주소 검색 완료 시 우편번호와 주소를 Context state에 설정하는 핸들러
  const handleAddressSelect = (selectedPostcode, selectedAddress) => {
    setPostcode(selectedPostcode);
    setAddress(selectedAddress);
  };

  // Daum Postcode API 팝업을 띄우는 함수
  const handleOpenPopup = () => {
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function (data) {
          handleAddressSelect(data.zonecode, data.address);
        }
      }).open();
    } else {
      alert("주소 검색 API를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    }
  };


  const handleLoadMyInfo = async () => {

    // 1. 로컬 스토리지에서 토큰 확인
    const token = localStorage.getItem('token');//나중에 수정해야 할 수도
    if (!token) {
      alert("로그인이 필요한 기능입니다.");
      // (필요 시) navigate('/login'); 
      return;
    }

    try {
      // 2. 백엔드 API 호출 (내 정보 조회)
      // Authorization 헤더에 토큰을 실어서 보냅니다.
      const response = await axios.get('http://localhost:8080/api/member/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const member = response.data; // 백엔드에서 받은 회원 정보 (Entity)
      console.log("불러온 회원 정보:", member);

      // 3. 받아온 정보로 입력창 채우기 (Context 상태 업데이트)

      // 이름 처리: DB에는 전체 이름(memName)만 있으므로, 임의로 성/이름을 나눕니다.
      if (member.memName && member.memName.length > 1) {
        setLastName(member.memName.substring(0, 1)); // 첫 글자를 성으로
        setFirstName(member.memName.substring(1));   // 나머지를 이름으로
      } else {
        setLastName(member.memName || "");
        setFirstName("");
      }

      // 나머지 정보 매핑 (값이 없을 경우 빈 문자열 처리)
      setPhone(member.memHp || "");
      setPostcode(member.memZipcode || "");
      setAddress(member.memAddress1 || "");
      setAddressDetail(member.memAddress2 || "");



    } catch (error) {
      console.error("내 정보 불러오기 실패:", error);
      alert("정보를 불러오는데 실패했습니다. (로그인 상태를 확인해주세요)");
    }
  };


  // 결제 페이지로 이동하기 전 필수 폼 필드 유효성 검사
  const handleToPayment = () => {
    if (!lastName || !firstName || !phone || !postcode || !address || !addressDetail) {
      alert('배송 정보를 모두 입력해주세요.');
    } else {
      // 모든 필드가 유효하면 결제 페이지로 라우팅
      navigate('/payment');
    }
  };

  // 배송비 무료 조건 계산 로직
  const freeShippingThreshold = 30000;
  const isShippingFree = orderSubtotal >= freeShippingThreshold;

  return (
    <div className="order-page">


      <h1>주문하기</h1>

      <div className="order-content-wrapper">
        {/* --- 2. 왼쪽: 배송 정보 입력 폼 --- */}
        <div className="shipping-details">

          {/* 섹션 제목과 내 정보 불러오기 버튼을 포함하는 헤더 */}
          <div className="section-header">
            <h2>배송 정보</h2>
            <button
              type="button"
              className="btn-load-info"
              onClick={handleLoadMyInfo} // [연결] 수정된 핸들러 실행
            >
              내 정보 불러오기
            </button>
          </div>
           {/*  필수 입력 안내 문구 */}
          <p className="required-note">
            * 표시는 필수 입력 사항입니다.
          </p>

          <form className="shipping-form">
            {/* 성/이름 입력 그룹 */}
            <div className="form-group-half">
              <div className="form-group">
                <label htmlFor="last-name">성 *</label>
                <input type="text" id="last-name" placeholder="김"
                  value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="first-name">이름 *</label>
                <input type="text" id="first-name" placeholder="민수"
                  value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
            </div>
            {/* 휴대폰 번호 입력 그룹 */}
            <div className="form-group">
              <label htmlFor="phone">휴대폰 번호 *</label>
              <input type="text" id="phone" placeholder="010-1234-5678"
                value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            {/* 우편번호 및 주소 검색 버튼 그룹 */}
            <div className="form-group form-group-with-button">
              <div className="form-group">
                <label htmlFor="postcode">우편번호 *</label>
                <input type="text" id="postcode" placeholder="12345"
                  value={postcode} readOnly /> {/* 주소 검색으로만 입력 가능 */}
              </div>
              <button type="button" className="btn-outline" onClick={handleOpenPopup}>
                주소 검색
              </button>
            </div>
            {/* 주소 입력 그룹 (검색 결과) */}
            <div className="form-group">
              <label htmlFor="address">주소 *</label>
              <input type="text" id="address" placeholder="서울시 강남구 테헤란로 123"
                value={address} readOnly /> {/* 주소 검색으로만 입력 가능 */}
            </div>
            {/* 상세 주소 입력 그룹 */}
            <div className="form-group">
              <label htmlFor="address-detail">상세 주소 *</label>
              <input type="text" id="address-detail" placeholder="456호"
                value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)} />
            </div>
            {/* 배송 메시지 입력 그룹 */}
            <div className="form-group">
              <label htmlFor="delivery-message">배송 메시지</label>
              <input type="text" id="delivery-message" placeholder="배송 시 요청사항을 입력해주세요"
                value={deliveryMessage} onChange={(e) => setDeliveryMessage(e.target.value)} />
            </div>
          </form>

          {/* 배송 방법 섹션 */}
          <h2>배송 방법</h2>
          <div className="shipping-method-box">
            <div className="method-title">
              <strong>일반 배송</strong>
              {/* 무료/유료 배송비 금액 표시 */}
              <span className={isShippingFree ? 'free' : 'fee'}>
                {isShippingFree ? '무료' : `${shippingFee.toLocaleString()}원`}
              </span>
            </div>
            <p>영업일 기준 2-3일 소요</p>
            {/* 무료 배송 조건 만족 여부에 따른 안내 메시지 */}
            {isShippingFree ? (
              <div className="shipping-highlight">✔ 무료 배송 가능</div>
            ) : (
              <div className="shipping-warning">
                30,000원을 채우지 못해 배송비 3,000원이 결제됩니다.
              </div>
            )}
          </div>
          {/* 배송 관련 기타 안내 사항 */}
          <p className="shipping-fine-print">
            30,000원 이상 구매 시 무료배송<br />
            제주도 및 도서산간 지역은 추가 배송비가 발생할 수 있습니다
          </p>
        </div>

        {/* --- 3. 오른쪽: 주문 요약 및 다음 단계 버튼 --- */}
        <div className="order-summary-sidebar">
          <div className="summary-box">
            <h3>배송지 확인</h3>
            <p>입력하신 정보를 확인한 후 다음 단계로 진행하세요.</p>
            {/* 결제 페이지로 이동하는 주 버튼 */}
            <button type="button" className="btn-primary" onClick={handleToPayment}>
              결제 정보 입력
            </button>
            {/* 이전 단계로 돌아가는 보조 버튼 (장바구니) */}
            <button type="button" className="btn-secondary" onClick={() => navigate("/cart")}>이전 단계</button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default OrderPage;