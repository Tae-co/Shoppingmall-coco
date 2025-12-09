import React from 'react';
import '../../../css/product/ProductSidebar.css';

// 필터 옵션 상수 데이터 (키워드 매핑용 ID 포함)
const filterOptions = {
  skinTypes: [
    { id: 'dry', label: '건성' }, 
    { id: 'oily', label: '지성' }, 
    { id: 'combination', label: '복합성' }, 
    { id: 'sensitive', label: '민감성' }
  ],
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
  onFilterGroupChange,
  isLoggedIn,
  isProfileMode,
  onProfileToggle
}) => {

  // 전체 선택 핸들러
  const handleSelectAll = (category, options) => {
    const currentSelected = activeFilters[category === 'skinType' ? 'skinTypes' : category === 'skinConcern' ? 'skinConcerns' : 'personalColors'];
    const allIds = options.map(opt => opt.id);
    
    // 현재 모든 옵션이 선택되어 있는지 확인
    const isAllSelected = allIds.every(id => currentSelected.includes(id));

    if (isAllSelected) {
      // 이미 모두 선택됨 -> 전체 해제
      onFilterGroupChange(category, []);
    } else {
      // 일부만 선택되거나 없음 -> 전체 선택
      onFilterGroupChange(category, allIds);
    }
  };

  // 특정 카테고리가 모두 선택되었는지 확인하는 헬퍼 함수
  const checkAllSelected = (category, options) => {
    const currentSelected = activeFilters[category === 'skinType' ? 'skinTypes' : category === 'skinConcern' ? 'skinConcerns' : 'personalColors'];
    return options.length > 0 && options.every(opt => currentSelected.includes(opt.id));
  };

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
          {/* 전체 선택 체크박스 */}
          <label className="filter-label" style={{fontWeight: 'bold'}}>
            <input 
              type="checkbox"
              className="filter-checkbox"
              checked={checkAllSelected('skinType', filterOptions.skinTypes)}
              onChange={() => handleSelectAll('skinType', filterOptions.skinTypes)}
            />
            <span className="checkbox-custom"></span>
            전체 선택
          </label>
          
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
          <label className="filter-label" style={{fontWeight: 'bold'}}>
            <input 
              type="checkbox"
              className="filter-checkbox"
              checked={checkAllSelected('skinConcern', filterOptions.skinConcerns)}
              onChange={() => handleSelectAll('skinConcern', filterOptions.skinConcerns)}
            />
            <span className="checkbox-custom"></span>
            전체 선택
          </label>

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
          <label className="filter-label" style={{fontWeight: 'bold'}}>
            <input 
              type="checkbox"
              className="filter-checkbox"
              checked={checkAllSelected('personalColor', filterOptions.personalColors)}
              onChange={() => handleSelectAll('personalColor', filterOptions.personalColors)}
            />
            <span className="checkbox-custom"></span>
            전체 선택
          </label>

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