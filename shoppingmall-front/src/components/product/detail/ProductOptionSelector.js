import React from 'react';

/**
 * [상품 옵션 선택기]
 * - 역할: 옵션 선택 드롭다운 표시 및 품절 임박 알림 노출
 */
const ProductOptionSelector = ({ options, selectedOption, onSelect }) => {
  if (!options || options.length === 0) return null;

  const selectedOpt = options.find(opt => opt.optionNo === Number(selectedOption));
  // 재고가 5개 미만이고 0개 초과일 때만 true
  const isLowStock = selectedOpt && selectedOpt.stock > 0 && selectedOpt.stock < 5;

  return (
    <div className="option-selector-container">
      <label htmlFor="product-option" className="visually-hidden">상품 옵션 선택</label>
      <select
        id="product-option"
        className="product-select"
        value={selectedOption}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">옵션을 선택하세요</option>
        {options.map((opt) => (
          <option key={opt.optionNo} value={opt.optionNo} disabled={opt.stock <= 0}>
            {opt.optionValue}
            {opt.addPrice > 0 ? ` (+${opt.addPrice.toLocaleString()}원)` : ''}
            {opt.stock > 0 ? ` (재고: ${opt.stock})` : ' (품절)'}
          </option>
        ))}
      </select>

      {/* 품절 임박 알림 메시지 */}
      {isLowStock && (
        <div className="low-stock-alert" style={{ 
          color: '#e74c3c', 
          fontSize: '16px', 
          fontWeight: '600', 
          marginTop: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          주문 폭주! 재고가 {selectedOpt.stock}개 남았습니다. 서두르세요!
        </div>
      )}
    </div>
  );
};

export default ProductOptionSelector;