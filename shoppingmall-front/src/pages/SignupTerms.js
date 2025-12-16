import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SignupTerms.css';
import SignupTermsPopup from '../components/SignupTermsPopup';

const SignupTerms = () => {
  const navigate = useNavigate();
  const [allAgreed, setAllAgreed] = useState(false);
  const [serviceAgreed, setServiceAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [termsType, setTermsType] = useState(null);

  // 개별 약관 동의 상태에 따라 전체 동의 체크박스 상태 업데이트
  useEffect(() => {
    if (serviceAgreed && privacyAgreed && marketingAgreed) {
      setAllAgreed(true);
    } else {
      setAllAgreed(false);
    }
  }, [serviceAgreed, privacyAgreed, marketingAgreed]);

  // 전체 동의 체크박스 토글 처리
  const handleAllAgreed = () => {
    const newValue = !allAgreed;
    setAllAgreed(newValue);
    setServiceAgreed(newValue);
    setPrivacyAgreed(newValue);
    setMarketingAgreed(newValue);
  };

  // 필수 약관 동의 여부 확인
  const isRequiredAgreed = serviceAgreed && privacyAgreed;

  // 로그인 페이지로 이동
  const handleCancel = () => {
    navigate('/login');
  };

  // 다음 단계(회원정보 입력)로 이동
  const handleNext = () => {
    if (isRequiredAgreed) {
      navigate('/signup/info');
    }
  };

  // 약관 상세 내용 조회
  const handleViewTerms = (type) => {
    setTermsType(type);
    setShowTermsPopup(true);
  };

  // 약관 팝업 닫기
  const handleCloseTermsPopup = () => {
    setShowTermsPopup(false);
    setTermsType(null);
  };

  return (
    <div className="signup-terms-container">
      <div className="signup-terms-card">
        <div className="signup-terms-header">
          <h1 className="signup-terms-title">회원가입</h1>
          <p className="signup-terms-subtitle">약관에 동의해주세요</p>
        </div>

        <div className="signup-terms-body">
          <div className="terms-section">
            <div 
              className="all-agree-item"
              onClick={handleAllAgreed}
            >
              <div className={`checkbox ${allAgreed ? 'checked' : ''}`}>
                {allAgreed && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3L4.5 8.5L2 6" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="all-agree-text">전체 동의</span>
            </div>

            <div className="terms-list">
              <div className="term-item">
                <div className="term-checkbox-wrapper">
                  <div 
                    className={`checkbox ${serviceAgreed ? 'checked' : ''}`}
                    onClick={() => setServiceAgreed(!serviceAgreed)}
                  >
                    {serviceAgreed && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="term-label">[필수] 서비스 이용약관</span>
                </div>
                <button 
                  className="view-button"
                  onClick={() => handleViewTerms('service')}
                >
                  보기
                </button>
              </div>

              <div className="term-item">
                <div className="term-checkbox-wrapper">
                  <div 
                    className={`checkbox ${privacyAgreed ? 'checked' : ''}`}
                    onClick={() => setPrivacyAgreed(!privacyAgreed)}
                  >
                    {privacyAgreed && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="term-label">[필수] 개인정보 처리방침</span>
                </div>
                <button 
                  className="view-button"
                  onClick={() => handleViewTerms('privacy')}
                >
                  보기
                </button>
              </div>

              <div className="term-item">
                <div className="term-checkbox-wrapper">
                  <div 
                    className={`checkbox ${marketingAgreed ? 'checked' : ''}`}
                    onClick={() => setMarketingAgreed(!marketingAgreed)}
                  >
                    {marketingAgreed && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="term-label">[선택] 마케팅 정보 수신 동의</span>
                </div>
              </div>
            </div>
          </div>

          <div className="button-group">
            <button className="cancel-button" onClick={handleCancel}>
              취소
            </button>
            <button 
              className={`next-button ${isRequiredAgreed ? 'active' : ''}`}
              onClick={handleNext}
              disabled={!isRequiredAgreed}
            >
              다음
            </button>
          </div>
        </div>
      </div>

      {showTermsPopup && (
        <SignupTermsPopup
          type={termsType}
          onClose={handleCloseTermsPopup}
        />
      )}
    </div>
  );
};

export default SignupTerms;

