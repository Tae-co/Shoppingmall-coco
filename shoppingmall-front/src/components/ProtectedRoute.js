import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isLoggedIn, getStoredMember, logout } from '../utils/api';

// 로그인 인증이 필요한 페이지 접근 제어
const ProtectedRoute = () => {
  const location = useLocation();
  
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  // 소셜 로그인 계정인지 확인
  const member = getStoredMember();
  const isSocialAccount = member?.memId && (
    member.memId.startsWith('KAKAO_') || 
    member.memId.startsWith('NAVER_') || 
    member.memId.startsWith('GOOGLE_')
  );

  // 소셜 로그인 계정이고 추가 정보가 필요한 경우
  if (isSocialAccount) {
    // 추가 정보 입력 페이지가 아니고, 추가 정보가 입력되지 않은 경우
    if (location.pathname !== '/kakao/additional-info') {
      const needsAdditionalInfo = member?.needsAdditionalInfo;
      const hasAdditionalInfo = member?.memName && member?.memHp;
      
      if (needsAdditionalInfo || !hasAdditionalInfo) {
        // 로그아웃 처리
        logout({ redirectTo: '/login' });
        return null;
      }
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;

