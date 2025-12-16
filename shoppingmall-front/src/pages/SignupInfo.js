import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SignupInfo.css';
import { 
  checkIdDuplicate, 
  checkNicknameDuplicate, 
  sendEmailVerificationCode, 
  verifyEmailCode,
  signup,
  validateEmail
} from '../utils/api';
import { useVerificationTimer } from '../hooks/useVerificationTimer';

const SignupInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    name: '',
    phoneNumber: '',
    email: '',
    zipcode: '',
    address1: '',
    address2: '',
    verificationCode: ''
  });
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const { timer, isSendingCode, setIsSendingCode, startTimer, resetTimer, formatTimer, isTimerActive } = useVerificationTimer();

  // 입력 필드 변경 처리 및 중복확인 상태 초기화
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'userId') {
      setIsIdChecked(false);
    }
    if (name === 'nickname') {
      setIsNicknameChecked(false);
    }
  };

  // 아이디 및 닉네임 중복 확인 처리
  const handleCheckDuplicate = async (type) => {
    try {
      if (type === 'id') {
        if (formData.userId.length < 4) {
          alert('아이디는 4자 이상 입력해주세요.');
          return;
        }
        const data = await checkIdDuplicate(formData.userId);
        
        if (data.available) {
          setIsIdChecked(true);
          alert('사용 가능한 아이디입니다.');
        } else {
          alert(data.message || '이미 사용 중인 아이디입니다.');
          setIsIdChecked(false);
        }
      } else if (type === 'nickname') {
        if (formData.nickname.length < 2) {
          alert('닉네임은 2자 이상 입력해주세요.');
          return;
        }
        const data = await checkNicknameDuplicate(formData.nickname);
        
        if (data.available) {
          setIsNicknameChecked(true);
          alert('사용 가능한 닉네임입니다.');
        } else {
          alert(data.message || '이미 사용 중인 닉네임입니다.');
          setIsNicknameChecked(false);
        }
      }
    } catch (error) {
      console.error('중복확인 오류:', error);
      alert(error.message || '중복확인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 이메일 인증번호 전송 처리
  const handleSendVerificationCode = async () => {
    if (!formData.email) {
      alert('이메일을 입력해주세요.');
      return;
    }

    if (!validateEmail(formData.email)) {
      alert('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setIsSendingCode(true);
    try {
      await sendEmailVerificationCode(formData.email);
      alert('인증번호가 이메일로 전송되었습니다.');
      startTimer();
      setIsPhoneVerified(false);
    } catch (error) {
      console.error('인증번호 전송 오류:', error);
      alert(error.message || '인증번호 전송 중 오류가 발생했습니다.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // 이메일 인증번호 검증 처리
  const handleVerifyCode = async () => {
    if (!formData.verificationCode) {
      alert('인증번호를 입력해주세요.');
      return;
    }

    if (!formData.email) {
      alert('이메일을 입력해주세요.');
      return;
    }

    try {
      await verifyEmailCode(formData.email, formData.verificationCode);
      setIsPhoneVerified(true);
      resetTimer();
      alert('인증이 완료되었습니다.');
    } catch (error) {
      console.error('인증번호 검증 오류:', error);
      alert(error.message || '인증번호가 일치하지 않습니다.');
      setIsPhoneVerified(false);
    }
  };

  // 다음 주소 API를 통한 주소 검색 처리
  const handleAddressSearch = () => {
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function(data) {
          let addr = '';
          
          if (data.userSelectedType === 'R') {
            addr = data.roadAddress;
          } else {
            addr = data.jibunAddress;
          }

          setFormData(prev => ({
            ...prev,
            zipcode: data.zonecode,
            address1: addr
          }));
          
          document.getElementById('address2').focus();
        }
      }).open();
    } else {
      alert('주소 검색 서비스를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
    }
  };

  // 회원가입 폼 제출 및 유효성 검증 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isIdChecked) {
      alert('아이디 중복확인을 해주세요.');
      return;
    }
    if (formData.password.length < 8) {
      alert('비밀번호는 8자 이상 입력해주세요.');
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!isNicknameChecked) {
      alert('닉네임 중복확인을 해주세요.');
      return;
    }
    if (!formData.name || formData.name.trim() === '') {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!formData.email || formData.email.trim() === '') {
      alert('이메일을 입력해주세요.');
      return;
    }
    if (!isPhoneVerified) {
      alert('이메일 인증을 완료해주세요.');
      return;
    }

    try {
      const signupData = {
        memId: formData.userId,
        memPwd: formData.password,
        memNickname: formData.nickname,
        memName: formData.name,
        memMail: formData.email || '',
        memHp: formData.phoneNumber,
        memZipcode: formData.zipcode || '',
        memAddress1: formData.address1 || '',
        memAddress2: formData.address2 || ''
      };

      await signup(signupData);
      alert('회원가입이 완료되었습니다.');
      navigate('/login');
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert(error.message || '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 약관 동의 페이지로 이동
  const handleBack = () => {
    navigate('/signup/terms');
  };

  return (
    <div className="signup-info-container">
      <div className="signup-info-card">
        <div className="signup-info-header">
          <h1 className="signup-info-title">회원가입</h1>
          <p className="signup-info-subtitle">회원정보를 입력해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-info-body">
          <div className="input-group">
            <label>아이디 *</label>
            <div className="input-with-button">
              <input
                type="text"
                name="userId"
                placeholder="4자 이상 입력"
                value={formData.userId}
                onChange={handleInputChange}
                className="signup-input"
              />
              <button
                type="button"
                className="check-button"
                onClick={() => handleCheckDuplicate('id')}
              >
                중복확인
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>비밀번호 *</label>
            <input
              type="password"
              name="password"
              placeholder="8자 이상 입력"
              value={formData.password}
              onChange={handleInputChange}
              className="signup-input"
            />
          </div>

          <div className="input-group">
            <label>비밀번호 확인 *</label>
            <input
              type="password"
              name="passwordConfirm"
              placeholder="비밀번호를 다시 입력"
              value={formData.passwordConfirm}
              onChange={handleInputChange}
              className="signup-input"
            />
          </div>

          <div className="input-group">
            <label>닉네임 *</label>
            <div className="input-with-button">
              <input
                type="text"
                name="nickname"
                placeholder="2자 이상 입력"
                value={formData.nickname}
                onChange={handleInputChange}
                className="signup-input"
              />
              <button
                type="button"
                className="check-button"
                onClick={() => handleCheckDuplicate('nickname')}
              >
                중복확인
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>이름 *</label>
            <input
              type="text"
              name="name"
              placeholder="이름을 입력하세요"
              value={formData.name}
              onChange={handleInputChange}
              className="signup-input"
            />
          </div>

          <div className="input-group">
            <label>이메일 *</label>
            <div className="input-with-button">
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleInputChange}
                className="signup-input"
                disabled={isPhoneVerified}
              />
              <button
                type="button"
                className="check-button"
                onClick={handleSendVerificationCode}
                disabled={isSendingCode || isTimerActive || isPhoneVerified}
              >
                {isSendingCode ? '전송중...' : isTimerActive ? `재전송(${formatTimer()})` : '인증번호'}
              </button>
            </div>
          </div>

          {isTimerActive && !isPhoneVerified && (
            <div className="input-group">
              <label>인증번호 *</label>
              <div className="input-with-button">
                <input
                  type="text"
                  name="verificationCode"
                  placeholder="인증번호 6자리를 입력하세요"
                  value={formData.verificationCode}
                  onChange={handleInputChange}
                  className="signup-input"
                  maxLength="6"
                />
                <button
                  type="button"
                  className="check-button"
                  onClick={handleVerifyCode}
                >
                  인증확인
                </button>
              </div>
              {isPhoneVerified && (
                <span style={{ color: 'green', fontSize: '12px', marginTop: '4px' }}>
                  ✓ 인증 완료
                </span>
              )}
            </div>
          )}

          {isPhoneVerified && (
            <div className="input-group">
              <span style={{ color: 'green', fontSize: '14px', fontWeight: '500' }}>
                ✓ 이메일 인증이 완료되었습니다.
              </span>
            </div>
          )}

          <div className="input-group">
            <label>전화번호</label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="010-1234-5678"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="signup-input"
            />
          </div>

          <div className="input-group">
            <label>주소</label>
            <div className="input-with-button">
              <input
                type="text"
                name="zipcode"
                placeholder="우편번호"
                value={formData.zipcode}
                onChange={handleInputChange}
                className="signup-input"
                readOnly
              />
              <button
                type="button"
                className="check-button"
                onClick={handleAddressSearch}
              >
                주소검색
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>기본주소</label>
            <input
              type="text"
              name="address1"
              placeholder="기본주소"
              value={formData.address1}
              onChange={handleInputChange}
              className="signup-input"
              readOnly
            />
          </div>

          <div className="input-group">
            <label>상세주소</label>
            <input
              type="text"
              id="address2"
              name="address2"
              placeholder="상세주소를 입력하세요"
              value={formData.address2}
              onChange={handleInputChange}
              className="signup-input"
            />
          </div>

          <div className="button-group">
            <button type="button" className="cancel-button" onClick={handleBack}>
              취소
            </button>
            <button type="submit" className="submit-button">
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupInfo;

