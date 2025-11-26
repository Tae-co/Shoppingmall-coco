import React from 'react';
import '../../../css/product/ProductListHeader.css';

const ProductListHeader = ({
  totalElements,
  sortOrder,
  onSortChange,
  onFilterToggle
}) => {
  return (
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
  );
};

export default ProductListHeader;