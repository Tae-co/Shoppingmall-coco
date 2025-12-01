import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/FindAccount.css';
import BackIcon from '../images/back.svg';
import { 
  sendFindIdVerificationCode, 
  findId, 
  sendResetPasswordVerificationCode, 
  resetPassword,
  validateEmail
} from '../utils/api';
import { useVerificationTimer } from '../hooks/useVerificationTimer';

const FindAccount = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('id'); // 'id' or 'password'
  const [email, setEmail] = useState('');
  const [memId, setMemId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [foundId, setFoundId] = useState('');
  const { timer, isSendingCode, setIsSendingCode, startTimer, resetTimer, formatTimer, isTimerActive } = useVerificationTimer();

  // 탭 전환 시 모든 입력값 및 상태 초기화
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setEmail('');
    setMemId('');
    setVerificationCode('');
    setNewPassword('');
    setNewPasswordConfirm('');
    resetTimer();
    setIsVerified(false);
    setFoundId('');
  };

  // 로그인 페이지로 이동
  const handleBackToLogin = () => {
    navigate('/login');
  };

  // 소셜 로그인 계정인지 확인
  const isSocialAccount = (memId) => {
    if (!memId) return false;
    return memId.startsWith('KAKAO_') || memId.startsWith('NAVER_') || memId.startsWith('GOOGLE_');
  };

  // 아이디/비밀번호 찾기용 인증번호 전송 처리
  const handleSendVerificationCode = async (e) => {
    e.preventDefault();

    if (activeTab === 'id') {
      if (!email.trim()) {
        alert('이메일을 입력해주세요.');
        return;
      }

      if (!validateEmail(email)) {
        alert('올바른 이메일 형식을 입력해주세요.');
        return;
      }

      setIsSendingCode(true);
      try {
        await sendFindIdVerificationCode(email);
        alert('인증번호가 이메일로 전송되었습니다.');
        startTimer();
        setIsVerified(false);
      } catch (error) {
        console.error('인증번호 전송 오류:', error);
        alert(error.message || '인증번호 전송 중 오류가 발생했습니다.');
      } finally {
        setIsSendingCode(false);
      }
    } else {
      if (!memId.trim()) {
        alert('아이디를 입력해주세요.');
        return;
      }
      
      // 소셜 로그인 계정인지 확인
      if (isSocialAccount(memId)) {
        alert('소셜 로그인으로 가입한 계정입니다. 비밀번호 찾기 기능을 사용할 수 없습니다. 해당 소셜 로그인 서비스를 통해 로그인해주세요.');
        return;
      }
      
      if (!email.trim()) {
        alert('이메일을 입력해주세요.');
        return;
      }

      if (!validateEmail(email)) {
        alert('올바른 이메일 형식을 입력해주세요.');
        return;
      }

      setIsSendingCode(true);
      try {
        await sendResetPasswordVerificationCode(memId, email);
        alert('인증번호가 이메일로 전송되었습니다.');
        startTimer();
        setIsVerified(false);
      } catch (error) {
        console.error('인증번호 전송 오류:', error);
        alert(error.message || '인증번호 전송 중 오류가 발생했습니다.');
      } finally {
        setIsSendingCode(false);
      }
    }
  };

  // 아이디 찾기 인증번호 검증 처리
  const handleFindId = async (e) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      alert('인증번호를 입력해주세요.');
      return;
    }

    try {
      const data = await findId(email, verificationCode);
      
      // 소셜 로그인 계정인지 확인
      if (isSocialAccount(data.memId)) {
        alert('소셜 로그인으로 가입한 계정입니다. 해당 소셜 로그인 서비스를 통해 로그인해주세요.');
        setFoundId('');
        setIsVerified(false);
        return;
      }
      
      setFoundId(data.memId);
      setIsVerified(true);
      resetTimer();
      alert('아이디 찾기가 완료되었습니다.');
    } catch (error) {
      console.error('아이디 찾기 오류:', error);
      alert(error.message || '아이디 찾기 중 오류가 발생했습니다.');
    }
  };

  // 비밀번호 재설정 처리
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      alert('인증번호를 입력해주세요.');
      return;
    }
    if (!newPassword.trim()) {
      alert('새 비밀번호를 입력해주세요.');
      return;
    }
    if (newPassword.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await resetPassword(memId, email, verificationCode, newPassword);
      alert('비밀번호가 재설정되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error);
      alert(error.message || '비밀번호 재설정 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="find-account-container">
      <div className="find-account-card">
        <div className="find-account-header">
          <button className="back-button" onClick={handleBackToLogin}>
            <img src={BackIcon} alt="뒤로가기" />
            <span>로그인으로 돌아가기</span>
          </button>
          <h1 className="find-account-title">계정 찾기</h1>
          <p className="find-account-subtitle">아이디 또는 비밀번호를 찾으세요</p>
        </div>

        <div className="find-account-body">
          <div className="tab-container">
            <button
              className={`tab-button ${activeTab === 'id' ? 'active' : ''}`}
              onClick={() => handleTabChange('id')}
            >
              아이디 찾기
            </button>
            <button
              className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => handleTabChange('password')}
            >
              비밀번호 찾기
            </button>
          </div>

          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            backgroundColor: '#F3F3F5', 
            borderRadius: '8px',
            fontSize: '13px',
            color: '#717182',
            lineHeight: '1.5'
          }}>
            <strong style={{ color: '#0A0A0A' }}>안내:</strong> 소셜 로그인(카카오, 네이버, 구글)으로 가입한 계정은 아이디/비밀번호 찾기 기능을 사용할 수 없습니다. 해당 소셜 로그인 서비스를 통해 로그인해주세요.
          </div>

          {activeTab === 'id' ? (
            <>
              {!foundId ? (
                <form onSubmit={handleSendVerificationCode} className="find-account-form">
                  <div className="input-group">
                    <label>이메일 *</label>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="find-account-input"
                      disabled={isTimerActive}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="verify-button"
                    disabled={isSendingCode || isTimerActive}
                  >
                    {isSendingCode ? '전송중...' : isTimerActive ? `재전송(${formatTimer()})` : '인증번호 받기'}
                  </button>
                </form>
              ) : null}

              {isTimerActive && !foundId && (
                <form onSubmit={handleFindId} className="find-account-form" style={{ marginTop: '20px' }}>
                  <div className="input-group">
                    <label>인증번호 *</label>
                    <input
                      type="text"
                      placeholder="인증번호 6자리를 입력하세요"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="find-account-input"
                      maxLength="6"
                    />
                  </div>

                  <button type="submit" className="verify-button">
                    아이디 찾기
                  </button>
                </form>
              )}

              {foundId && (
                <div className="find-account-result">
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '10px' }}>아이디 찾기 결과</h3>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#155DFC' }}>
                      {foundId}
                    </p>
                    <button 
                      onClick={handleBackToLogin}
                      style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#030213',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      로그인하러 가기
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {!isVerified ? (
                <>
                  <form onSubmit={handleSendVerificationCode} className="find-account-form">
                    <div className="input-group">
                      <label>아이디 *</label>
                      <input
                        type="text"
                        placeholder="아이디를 입력하세요"
                        value={memId}
                        onChange={(e) => setMemId(e.target.value)}
                        className="find-account-input"
                        disabled={isTimerActive}
                      />
                    </div>

                    <div className="input-group">
                      <label>이메일 *</label>
                      <input
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="find-account-input"
                        disabled={isTimerActive}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="verify-button"
                      disabled={isSendingCode || isTimerActive}
                    >
                      {isSendingCode ? '전송중...' : isTimerActive ? `재전송(${formatTimer()})` : '인증번호 받기'}
                    </button>
                  </form>

                  {isTimerActive && (
                    <form onSubmit={handleResetPassword} className="find-account-form" style={{ marginTop: '20px' }}>
                      <div className="input-group">
                        <label>인증번호 *</label>
                        <input
                          type="text"
                          placeholder="인증번호 6자리를 입력하세요"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="find-account-input"
                          maxLength="6"
                        />
                      </div>

                      <div className="input-group">
                        <label>새 비밀번호 *</label>
                        <input
                          type="password"
                          placeholder="8자 이상 입력"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="find-account-input"
                        />
                      </div>

                      <div className="input-group">
                        <label>새 비밀번호 확인 *</label>
                        <input
                          type="password"
                          placeholder="비밀번호를 다시 입력"
                          value={newPasswordConfirm}
                          onChange={(e) => setNewPasswordConfirm(e.target.value)}
                          className="find-account-input"
                        />
                      </div>

                      <button type="submit" className="verify-button">
                        비밀번호 재설정
                      </button>
                    </form>
                  )}
                </>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindAccount;

