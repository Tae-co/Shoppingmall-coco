import React from 'react';
import '../../css/TermsPopup.css'; 

// 약관 상세 내용을 모달로 보여주는 컴포넌트
// 부모(PaymentPage)로부터 모달을 닫는 'onClose' 함수를 props로 받습니다.
function TermsPopup({ onClose }) {
  return (
    // 배경 (오버레이) 클릭 시 모달이 닫히도록 설정
    <div className="popup-overlay" onClick={onClose}>
      
      {/* 팝업 내용 (하얀 박스) 영역 */}
      {/* 내부 콘텐츠 클릭 시 오버레이의 onClick 이벤트 전파를 막아 모달이 닫히지 않도록 함 */}
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        
        {/* 팝업 헤더 영역 */}
        <div className="popup-header">
          {/* 팝업 제목 */}
          <h3>약관 및 정책</h3>
          {/* 닫기 버튼 */}
          <button onClick={onClose} className="btn-close">&times;</button>
        </div>

        {/* 팝업 본문 (스크롤 가능한 약관 텍스트 영역) */}
        <div className="popup-body">
          <div className="terms-content">
            {/* 첫 번째 약관: 구매조건 및 결제대행 서비스 약관 */}
            <h4>구매조건 및 결제대행 서비스 약관 (필수)</h4>
            <p>
              <strong>제1조 (목적)</strong><br />
              이 약관은 coco 쇼핑몰(이하 "몰")이 운영하는 사이버 몰에서 제공하는 인터넷 관련 서비스(이하 "서비스")를 이용함에 있어 "몰"과 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
            <p>
              <strong>제2조 (이용자의 의무)</strong><br />
              이용자는 다음 행위를 하여서는 안 됩니다.
              <ul>
                <li>신청 또는 변경 시 허위 내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>"몰"에 게시된 정보의 변경</li>
                <li>"몰"이 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>"몰" 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
              </ul>
            </p>
            <p>
              <strong>제3조 (개인정보보호)</strong><br />
              ① "몰"은 이용자의 개인정보 수집 시 서비스 제공을 위하여 필요한 범위에서 최소한의 개인정보를 수집합니다.
              ② "몰"이 이용자의 개인식별이 가능한 개인정보를 수집하는 때에는 반드시 당해 이용자의 동의를 받습니다.
              ③ 제공된 개인정보는 당해 이용자의 동의 없이 목적 외의 이용이나 제3자에게 제공할 수 없으며, 이에 대한 모든 책임은 "몰"이 집니다.
            </p>
            <p>... (이하 약관 내용은 법률 전문가와 상의하세요) ...</p>
            
            <hr style={{ margin: '20px 0' }} />

            {/* 두 번째 약관: 개인정보 수집 및 이용 동의 */}
            <h4>개인정보 수집 및 이용 동의 (필수)</h4>
            <p>
              "몰"은(는) 주문 처리를 위해 다음과 같이 개인정보를 수집 및 이용합니다.
            </p>
            <ul>
              <li><strong>수집하는 자:</strong> coco 쇼핑몰</li>
              <li><strong>수집·이용 목적:</strong> 주문 상품의 배송, 결제 처리 및 고객상담</li>
              <li><strong>수집하는 개인정보 항목:</strong> (필수) 성명, 휴대폰 번호, 주소, (선택) 배송 메시지</li>
              <li><strong>보유 및 이용 기간:</strong> 전자상거래법 등 관련 법령에 따른 보관 기간 (예: 5년) 또는 회원 탈퇴 시까지</li>
            </ul>
            <p>
              귀하는 개인정보 수집 및 이용에 동의를 거부할 권리가 있습니다.
              <br />
              <strong>(필수) 항목에 동의를 거부하실 경우, 상품 주문 및 배송 서비스 이용이 불가능합니다.</strong>
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default TermsPopup;