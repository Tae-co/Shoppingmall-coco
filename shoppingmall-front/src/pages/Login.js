import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import GoogleIcon from '../images/google.svg';
import NaverIcon from '../images/naver.svg';
import KakaoIcon from '../images/kakao.svg';
import LoginIcon from '../images/login.svg';
import { login as memberLogin, kakaoLogin, naverLogin, googleLogin } from '../utils/api';
import SkinProfilePopup from '../components/SkinProfilePopup';

const isAdminUser = (member) => (member?.role || '').toUpperCase() === 'ADMIN';

const Login = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showSkinProfilePopup, setShowSkinProfilePopup] = useState(false);

  // 컴포넌트 마운트 시 소셜 로그인 SDK 초기화
  useEffect(() => {
    // 카카오 SDK 초기화
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.REACT_APP_KAKAO_JS_KEY || 'YOUR_KAKAO_JS_KEY');
    }
  }, []);

  // 일반 로그인 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId.trim()) {
      alert('아이디를 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    try {
      const data = await memberLogin({
        memId: userId,
        memPwd: password
      });

      alert('로그인되었습니다.');
      
      const isAdmin = isAdminUser(data);

      // 스킨 프로필이 없으면 팝업 표시 (관리자는 제외)
      if (!data.hasSkinProfile && !isAdmin) {
        setShowSkinProfilePopup(true);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      alert(error.message || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 아이디/비밀번호 찾기 페이지로 이동
  const handleFindAccount = (e) => {
    e.preventDefault();
    navigate('/find-account');
  };

  // 회원가입 페이지로 이동
  const handleSignup = (e) => {
    e.preventDefault();
    navigate('/signup/terms');
  };

  // 카카오 소셜 로그인 처리
  const handleKakaoLogin = async () => {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      alert('카카오 SDK가 초기화되지 않았습니다.');
      return;
    }

    try {
      window.Kakao.Auth.logout(() => {
        setTimeout(() => {
          window.Kakao.Auth.login({
            success: async (authObj) => {
              try {
                const data = await kakaoLogin(authObj.access_token);
                
                if (data.needsAdditionalInfo) {
                  navigate('/kakao/additional-info');
                } else {
                  alert('카카오 로그인되었습니다.');
                  
                  const isAdmin = isAdminUser(data);

                  // 스킨 프로필이 없으면 팝업 표시 (관리자는 제외)
                  if (!data.hasSkinProfile && !isAdmin) {
                    setShowSkinProfilePopup(true);
                  } else {
                    navigate('/');
                  }
                }
              } catch (error) {
                console.error('카카오 로그인 오류:', error);
                alert(error.message || '카카오 로그인 중 오류가 발생했습니다.');
              }
            },
            fail: (err) => {
              console.error('카카오 로그인 취소:', err);
            }
          });
        }, 800);
      });
    } catch (error) {
      console.error('카카오 로그인 오류:', error);
      alert('카카오 로그인 중 오류가 발생했습니다.');
    }
  };

  // 네이버 소셜 로그인 처리
  const handleNaverLogin = () => {
    const clientId = process.env.REACT_APP_NAVER_CLIENT_ID || 'YOUR_NAVER_CLIENT_ID';
    const redirectUri = encodeURIComponent(window.location.origin + '/login/naver/callback');
    const state = Math.random().toString(36).substring(2, 15);
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;
    
    // 상태값을 localStorage에 저장 (CSRF 방지)
    localStorage.setItem('naver_state', state);
    
    // 네이버 로그인 페이지로 리다이렉트
    window.location.href = naverAuthUrl;
  };

  // 구글 소셜 로그인 처리
  const handleGoogleLogin = () => {
    if (!window.google || !window.google.accounts) {
      alert('구글 SDK가 초기화되지 않았습니다.');
      return;
    }

    try {
      // Google One Tap 로그인 시도
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One Tap이 표시되지 않으면 직접 로그인 버튼 클릭
          window.google.accounts.oauth2.initTokenClient({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
            scope: 'email profile',
            callback: async (response) => {
              try {
                const data = await googleLogin(response.access_token);
                
                if (data.needsAdditionalInfo) {
                  navigate('/kakao/additional-info');
                } else {
                  alert('구글 로그인되었습니다.');
                  
                  const isAdmin = isAdminUser(data);

                  // 스킨 프로필이 없으면 팝업 표시 (관리자는 제외)
                  if (!data.hasSkinProfile && !isAdmin) {
                    setShowSkinProfilePopup(true);
                  } else {
                    navigate('/');
                  }
                }
              } catch (error) {
                console.error('구글 로그인 오류:', error);
                alert(error.message || '구글 로그인 중 오류가 발생했습니다.');
              }
            }
          }).requestAccessToken();
        }
      });
    } catch (error) {
      console.error('구글 로그인 오류:', error);
      alert('구글 로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Coco</h1>
          <p className="login-subtitle">계정에 로그인하세요</p>
        </div>

        <div className="login-body">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label>아이디</label>
              <input
                type="text"
                placeholder="아이디를 입력하세요"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="login-input"
              />
            </div>

            <div className="input-group">
              <label>비밀번호</label>
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
              />
            </div>

            <button type="submit" className="login-submit-button">
              <img src={LoginIcon} alt="로그인" className="login-icon" />
              로그인
            </button>
          </form>

          <div className="social-divider">
            <div className="divider-line"></div>
            <span className="divider-text">또는</span>
            <div className="divider-line"></div>
          </div>

          <div className="social-buttons">
            <button type="button" className="social-button social-button-kakao" onClick={handleKakaoLogin}>
              <img src={KakaoIcon} alt="Kakao" />
            </button>
            <button type="button" className="social-button social-button-naver" onClick={handleNaverLogin}>
              <img src={NaverIcon} alt="Naver" />
            </button>
            <button type="button" className="social-button social-button-google" onClick={handleGoogleLogin}>
              <img src={GoogleIcon} alt="Google" />
            </button>
          </div>

          <div className="find-account">
            <a href="#" className="find-link" onClick={handleFindAccount}>아이디 / 비밀번호 찾기</a>
          </div>
        </div>

        <div className="login-footer">
          <div className="footer-divider"></div>
          <div className="footer-signup">
            <span>아직 계정이 없으신가요?</span>
            <a href="#" className="signup-link" onClick={handleSignup}>회원가입</a>
          </div>
        </div>
      </div>
      
      {showSkinProfilePopup && (
        <SkinProfilePopup
          onClose={() => setShowSkinProfilePopup(false)}
          onLater={() => navigate('/')}
        />
      )}
    </div>
  );
};

export default Login;

