import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../../css/product/ShopSearchBar.css'; // 전용 CSS 파일

const ShopSearchBar = ({ searchTerm, onSearchChange }) => {
  // 내부 입력값 관리 (타이핑 시 끊김 방지)
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // 부모(URL)의 검색어가 변경되면 내부 값도 동기화 (예: 뒤로가기)
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // 입력 핸들러
  const handleInputChange = (e) => {
    setLocalSearchTerm(e.target.value);
  };

  // Debounce: 사용자가 입력을 멈춘 후 0.5초 뒤에 검색 실행
  useEffect(() => {
    const timer = setTimeout(() => {
      // 값이 실제로 변했을 때만 부모 함수 호출
      if (localSearchTerm !== searchTerm) {
        // 부모의 핸들러 규격(event 객체 형태)에 맞춰 전달
        onSearchChange({ target: { value: localSearchTerm } });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchTerm, searchTerm, onSearchChange]);

  return (
    <div className="shop-search-container">
      <div className="search-input-wrapper">
        <input 
          type="text" 
          placeholder="검색어를 입력해보세요" 
          className="shop-search-input"
          value={localSearchTerm}
          onChange={handleInputChange}
        />
        <button className="shop-search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path fill="#777" fillRule="evenodd" d="M15.571 16.631a8.275 8.275 0 1 1 1.06-1.06l4.5 4.498-1.061 1.06-4.499-4.498Zm1.478-6.357a6.775 6.775 0 1 1-13.55 0 6.775 6.775 0 0 1 13.55 0Z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Props 타입 정의
ShopSearchBar.propTypes = {
  searchTerm: PropTypes.string,    // 검색어
  onSearchChange: PropTypes.func   // 핸들러
};

// 기본값 설정
ShopSearchBar.defaultProps = {
  searchTerm: '',
  onSearchChange: () => {}
};

export default ShopSearchBar;