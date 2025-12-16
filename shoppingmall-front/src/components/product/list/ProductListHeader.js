import React from 'react';
import PropTypes from 'prop-types';
import ShopSearchBar from './ShopSearchBar';
import '../../../css/product/ProductListHeader.css';

const ProductListHeader = ({
  searchTerm,
  onSearchChange,
  totalElements,
  sortOrder,
  onSortChange,
  onFilterToggle
}) => {
  return (

    <div className="product-header-wrapper">

      {/* 검색창 컴포넌트 사용 */}
      <ShopSearchBar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />

      {/* 하단 필터/정렬/카운트 영역 */}
      <div className="top-bar">
        <div className="left-group">
          <button className="filter-button" onClick={onFilterToggle}>
            필터
          </button>
          <span className="product-count">
            총 <strong>{totalElements}</strong>개
          </span>
        </div>

        <div className="right-group">
          <select
            className="sort-select"
            value={sortOrder}
            onChange={onSortChange}
          >
            <option value="popularity">인기순</option>
            <option value="newest">최신순</option>
            <option value="priceAsc">가격 낮은 순</option>
            <option value="priceDesc">가격 높은 순</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Props 타입 정의
ProductListHeader.propTypes = {
  searchTerm: PropTypes.string,          // 검색어
  onSearchChange: PropTypes.func,        // 검색어 변경 핸들러
  totalElements: PropTypes.number,       // 총 상품 수
  sortOrder: PropTypes.string,           // 정렬 기준
  onSortChange: PropTypes.func,          // 정렬 변경 핸들러
  onFilterToggle: PropTypes.func         // 필터 토글 핸들러
};

// 기본값 설정
ProductListHeader.defaultProps = {
  searchTerm: '',
  totalElements: 0,
  sortOrder: 'popularity',
  onSearchChange: () => {},
  onSortChange: () => {},
  onFilterToggle: () => {}
};

export default ProductListHeader;