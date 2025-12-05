import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/error/Forbidden.css';

const ProductStopped = () => {
  const navigate = useNavigate();

  return (
    <div className="forbidden-container">
      <h1 className="forbidden-code" style={{ fontSize: '120px' }}>STOP</h1>
      <h2 className="forbidden-title">판매가 중지된 상품입니다</h2>
      <p className="forbidden-desc">
        해당 상품은 더 이상 판매하지 않아 구매하실 수 없습니다.<br />
        다른 비슷한 상품을 찾아보시는 건 어떨까요?
      </p>
      
      <div className="btn-group">
        <button onClick={() => navigate('/product')} className="back-btn">
          상품 목록으로
        </button>
        <button onClick={() => navigate('/')} className="login-btn">
          홈으로 가기
        </button>
      </div>
    </div>
  );
};

export default ProductStopped;