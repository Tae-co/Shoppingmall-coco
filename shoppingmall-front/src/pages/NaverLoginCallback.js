import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchWithoutAuth, storage, STORAGE_KEYS, checkSkinProfile, getStoredMember } from '../utils/api';
import SkinProfilePopup from '../components/SkinProfilePopup';
import Logo from '../images/logo.png';
import '../css/Login.css';

const NaverLoginCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSkinProfilePopup, setShowSkinProfilePopup] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const storedState = localStorage.getItem('naver_state');
    const error = searchParams.get('error');

    // 에러가 있으면 로그인 실패
    if (error) {
      alert('네이버 로그인에 실패했습니다.');
      localStorage.removeItem('naver_state');
      navigate('/login');
      return;
    }

    // 상태값 검증 (CSRF 방지)
    if (!state || state !== storedState) {
      alert('네이버 로그인 인증에 실패했습니다.');
      localStorage.removeItem('naver_state');
      navigate('/login');
      return;
    }

    // 코드가 없으면 에러
    if (!code) {
      alert('네이버 로그인에 실패했습니다.');
      localStorage.removeItem('naver_state');
      navigate('/login');
      return;
    }

    // 네이버 로그인 처리 (백엔드에서 code를 받아서 처리)
    const handleNaverLogin = async () => {
      try {
        const response = await fetchWithoutAuth('/member/naver/login', {
          method: 'POST',
          body: JSON.stringify({ code, state }),
        });

        const data = await response.json();

        if (response.ok) {
          // 로그인 성공 처리
          if (data.token) {
            storage.set(STORAGE_KEYS.TOKEN, data.token);
          }
          storage.set(STORAGE_KEYS.MEMBER, JSON.stringify(data));
          window.dispatchEvent(new Event('loginStatusChanged'));

          if (data.needsAdditionalInfo) {
            navigate('/kakao/additional-info');
          } else {
            alert('네이버 로그인되었습니다.');

            const isAdmin = (data.role || '').toUpperCase() === 'ADMIN';

            // 스킨 프로필이 없으면 팝업 표시 (관리자는 제외)
            if (data.memNo && !isAdmin) {
              const hasProfile = await checkSkinProfile(data.memNo);
              if (!hasProfile) {
                setShowSkinProfilePopup(true);
              } else {
                navigate('/');
              }
            } else {
              navigate('/');
            }
          }
        } else {
          throw new Error(data.message || '네이버 로그인에 실패했습니다.');
        }
      } catch (error) {
        console.error('네이버 로그인 오류:', error);
        alert(error.message || '네이버 로그인 중 오류가 발생했습니다.');
        navigate('/login');
      } finally {
        localStorage.removeItem('naver_state');
      }
    };

    handleNaverLogin();
  }, [searchParams, navigate]);

  return (
    <>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo-container">
              <img src={Logo} alt="Coco" className="login-logo" />
            </div>
            <p className="login-subtitle">네이버 로그인 처리 중...</p>
          </div>
        </div>
      </div>
      
      {showSkinProfilePopup && (
        <SkinProfilePopup
          onClose={() => setShowSkinProfilePopup(false)}
          onLater={() => navigate('/')}
        />
      )}
    </>
  );
};

export default NaverLoginCallback;

