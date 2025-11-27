import React from 'react';
import '../../../css/product/ProductSidebar.css';

// 필터 옵션 상수 데이터 (키워드 매핑용 ID 포함)
const filterOptions = {
  skinTypes: [{ id: 'all', label: '모든 피부' }, { id: 'dry', label: '건성' }, { id: 'oily', label: '지성' }, { id: 'combination', label: '복합성' }, { id: 'sensitive', label: '민감성' }],
  skinConcerns: [
    { id: 'hydration', label: '수분' },
    { id: 'moisture', label: '보습' },
    { id: 'brightening', label: '미백' },
    { id: 'tone', label: '피부톤' },
    { id: 'soothing', label: '진정' },
    { id: 'sensitive', label: '민감' },
    { id: 'uv', label: '자외선차단' },
    { id: 'wrinkle', label: '주름' },
    { id: 'elasticity', label: '탄력' },
    { id: 'pores', label: '모공' }
  ],
  personalColors: [
    { id: 'spring', label: '봄 웜톤' }, 
    { id: 'summer', label: '여름 쿨톤' }, 
    { id: 'autumn', label: '가을 웜톤' }, 
    { id: 'winter', label: '겨울 쿨톤' }
  ]
};

/**
 * [상품 목록] 좌측 필터 사이드바 컴포넌트
 * - 모바일 환경에서는 드로어(Drawer) 형태로 동작함
 */
const ProductSidebar = ({
  isOpen,
  onClose,
  closeButtonRef,
  activeFilters,
  onFilterChange,
  isLoggedIn,
  isProfileMode,
  onProfileToggle
}) => {
  return (
    <>
      {/* 모바일용 배경 오버레이 (클릭 시 닫힘) */}
      <div 
        className={`backdrop ${isOpen ? 'open' : ''}`} 
        onClick={onClose} 
      />
      
      {/* 사이드바 본체 */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button 
          className="close-button" 
          ref={closeButtonRef} 
          onClick={onClose}
        >
          &times;
        </button>

        <h3 className="filter-title">필터</h3>

        {/* 로그인 회원 전용: 내 프로필 기반 자동 필터 버튼 */}
        {isLoggedIn && (
          <button 
            className={`profile-toggle-btn ${isProfileMode ? 'active' : ''}`}
            onClick={onProfileToggle} 
          >
            {isProfileMode ? '✔ 내 피부 맞춤 ON' : '내 피부 맞춤 적용'}
          </button>
        )}
        
        {/* 피부타입 필터 */}
        <div className="filter-group">
          <h4 className="filter-group-title">피부타입</h4>
          {filterOptions.skinTypes.map(option => (
            <label key={option.id} className="filter-label">
              <input 
                type="checkbox"
                className="filter-checkbox"
                checked={activeFilters.skinTypes.includes(option.id)}
                onChange={() => onFilterChange('skinType', option.id)}
              />
              <span className="checkbox-custom"></span>
              {option.label}
            </label>
          ))}
        </div>
      
        {/* 피부고민 필터 */}
        <div className="filter-group">
          <h4 className="filter-group-title">피부고민</h4>
          {filterOptions.skinConcerns.map(option => (
            <label key={option.id} className="filter-label">
              <input 
                type="checkbox"
                className="filter-checkbox"
                checked={activeFilters.skinConcerns.includes(option.id)}
                onChange={() => onFilterChange('skinConcern', option.id)}
              />
              <span className="checkbox-custom"></span>
              {option.label}
            </label>
          ))}
        </div> 
        
        {/* 퍼스널컬러 필터 */}
        <div className="filter-group">
          <h4 className="filter-group-title">퍼스널컬러</h4>
          {filterOptions.personalColors.map(option => (
            <label key={option.id} className="filter-label">
              <input 
                type="checkbox"
                className="filter-checkbox"
                checked={activeFilters.personalColors.includes(option.id)}
                onChange={() => onFilterChange('personalColor', option.id)}
              />
              <span className="checkbox-custom"></span>
              {option.label}
            </label>
          ))}
        </div>

      </aside>
    </>
  );
};

export default ProductSidebar;