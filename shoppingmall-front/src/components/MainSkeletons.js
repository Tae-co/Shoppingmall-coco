import React from 'react';
import '../css/product/Skeleton.css';

// 인기 상품 (BestSeller) 로딩 스켈레톤
export const BestSellerSkeleton = () => {
  // 슬라이드 개수만큼 카드 생성 (4개)
  return (
    <div className="skeleton-slider-wrapper">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton-slide-card">
          {/* 이미지 영역 */}
          <div className="skeleton-base" style={{ width: '100%', height: '250px', borderRadius: '8px' }} />
          {/* 텍스트 영역 */}
          <div style={{ marginTop: '15px' }}>
            <div className="skeleton-base" style={{ width: '60%', height: '20px', marginBottom: '8px' }} />
            <div className="skeleton-base" style={{ width: '40%', height: '15px', marginBottom: '15px' }} />
            <div className="skeleton-base" style={{ width: '30%', height: '24px' }} />
          </div>
          {/* 버튼 영역 */}
          <div className="skeleton-base" style={{ width: '100%', height: '40px', marginTop: '15px', borderRadius: '8px' }} />
        </div>
      ))}
    </div>
  );
};

// 추천 메이트 (Home_Comate) 로딩 스켈레톤
export const ComateSkeleton = () => {
  // 슬라이드 개수만큼 프로필 생성 (5개)
  return (
    <div className="skeleton-slider-wrapper">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="skeleton-comate-card">
          {/* 프로필 이미지 */}
          <div className="skeleton-base skeleton-circle" />
          {/* 닉네임 */}
          <div className="skeleton-base" style={{ width: '80px', height: '20px', marginBottom: '10px' }} />
          {/* 태그 영역 */}
          <div className="skeleton-base" style={{ width: '120px', height: '15px', marginBottom: '20px' }} />
          {/* 스탯 영역 */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
             <div className="skeleton-base" style={{ width: '40px', height: '30px' }} />
             <div className="skeleton-base" style={{ width: '40px', height: '30px' }} />
          </div>
          {/* 팔로우 버튼 */}
          <div className="skeleton-base" style={{ width: '100px', height: '35px', borderRadius: '20px' }} />
        </div>
      ))}
    </div>
  );
};