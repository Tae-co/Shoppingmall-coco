import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isLoggedIn, getStoredMember, getCurrentMember } from '../utils/api';
import Forbidden from '../pages/error/Forbidden';

// 관리자 권한이 필요한 페이지 접근 제어
const AdminProtectedRoute = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      // 로그인 체크
      if (!isLoggedIn()) {
        setIsChecking(false);
        return;
      }

      try {
        // 백엔드에서 최신 권한 정보 확인
        const memberData = await getCurrentMember();
        const userRole = memberData?.role || '';
        
        if (userRole === 'ADMIN' || userRole === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        // 백엔드 호출 실패 시 localStorage에서 확인
        console.error('권한 확인 실패:', error);
        const memberData = getStoredMember();
        const userRole = memberData?.role || '';
        setIsAdmin(userRole === 'ADMIN' || userRole === 'admin');
      }
      
      setIsChecking(false);
    };

    checkAdminRole();
  }, []);

  if (isChecking) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>권한 확인 중...</div>;
  }

  // 로그인 체크
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  // 관리자 권한 체크
  if (!isAdmin) {
    return <Forbidden />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;

