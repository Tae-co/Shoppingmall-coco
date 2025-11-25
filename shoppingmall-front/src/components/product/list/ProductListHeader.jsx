import React from 'react';
import styled from 'styled-components';

// 스타일 컴포넌트
const SearchContainer = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 15px 20px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const FilterButton = styled.button`
  display: none;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  @media (max-width: 768px) {
    display: block;
    margin-right: 10px;
  }
`;

const TopBarControls = styled.div`
  display: flex;
  align-items: center;
`;

const ProductCount = styled.span`
  font-size: 16px;
  font-weight: 600;
  & strong {
    color: #4e54c8;
  }
`;

const SortSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
`;

const ProductListHeader = ({
  searchTerm,
  onSearchChange,
  totalElements,
  sortOrder,
  onSortChange,
  onFilterToggle // (필터 열기 버튼 클릭)
}) => {
  return (
    <>
      <TopBar>
        <TopBarControls>
          <FilterButton onClick={onFilterToggle}>
            필터
          </FilterButton>
          <ProductCount>
            총 <strong>{totalElements}</strong>개 상품
          </ProductCount>
        </TopBarControls>
        
        <SortSelect 
          value={sortOrder} 
          onChange={onSortChange}
        >
          <option value="popularity">인기순</option>
          <option value="newest">최신순</option>
          <option value="priceAsc">가격 낮은 순</option>
          <option value="priceDesc">가격 높은 순</option>
        </SortSelect>
      </TopBar>
    </>
  );
};

export default ProductListHeader;
