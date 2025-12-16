import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/error/Forbidden.css';

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="forbidden-container">
      <h1 className="forbidden-code">403</h1>
      <h2 className="forbidden-title">접근 권한이 없습니다</h2>
      <p className="forbidden-desc">
        요청하신 페이지를 보실 수 있는 권한이 없습니다.<br />
        관리자 계정으로 로그인되어 있는지 확인해주세요.
      </p>
      
      <div className="btn-group">
        <button onClick={() => navigate(-1)} className="back-btn">
          이전 페이지
        </button>
        <button onClick={() => navigate('/login')} className="login-btn">
          로그인 페이지로
        </button>
      </div>
    </div>
  );
};

export default Forbidden;