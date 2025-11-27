import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SkinProfilePopup.css';

function SkinProfilePopup({ onClose, onLater }) {
  const navigate = useNavigate();

  const handleCreateNow = () => {
    onClose();
    navigate('/profile-edit');
  };

  const handleLater = () => {
    onClose();
    if (onLater) {
      onLater();
    }
  };

  return (
    <div className="skin-popup-overlay" onClick={handleLater}>
      <div className="skin-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="skin-popup-header">
          <h3>스킨 프로필을 작성해보세요</h3>
          <button onClick={handleLater} className="skin-popup-close">&times;</button>
        </div>

        <div className="skin-popup-body">
          <div className="skin-popup-intro">
            <p className="skin-popup-title">나만의 맞춤 쇼핑을 시작하세요</p>
            <p className="skin-popup-subtitle">
              스킨 프로필을 작성하면 더 정확한 상품 추천을 받을 수 있어요
            </p>
          </div>

          <div className="skin-popup-benefits">
            <div className="benefit-item">
              <div className="benefit-text">
                <strong>맞춤 상품 추천</strong>
                <p>나의 피부 타입과 고민에 맞는 제품을 추천받아요</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-text">
                <strong>코메이트 매칭</strong>
                <p>비슷한 피부 타입의 사용자 리뷰를 우선적으로 확인해요</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-text">
                <strong>스마트 필터링</strong>
                <p>상품 목록에서 내 피부에 맞는 제품만 빠르게 찾아요</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-text">
                <strong>리뷰 정확도 향상</strong>
                <p>나와 유사한 피부 타입의 리뷰를 더 많이 볼 수 있어요</p>
              </div>
            </div>
          </div>
        </div>

        <div className="skin-popup-footer">
          <button className="skin-popup-button later" onClick={handleLater}>
            나중에 작성하기
          </button>
          <button className="skin-popup-button create" onClick={handleCreateNow}>
            지금 바로 작성하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default SkinProfilePopup;

