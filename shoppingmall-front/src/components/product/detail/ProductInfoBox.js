import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductButton from '../ProductButton';
import SimilarSkinReview from '../../../features/SimilarSkinReview';
import '../../../css/product/ProductInfoBox.css';

/**
 * [상품 상세] 우측 정보 및 구매 액션 영역 컴포넌트
 */

const skinTypeMap = { all: '모든피부', dry: '건성', oily: '지성', combination: '복합성', sensitive: '민감성' };
const skinConcernMap = {
  hydration: '수분', moisture: '보습', brightening: '미백', tone: '피부톤',
  soothing: '진정', sensitive: '민감', uv: '자외선차단', wrinkle: '주름',
  elasticity: '탄력', pores: '모공'
};
const personalColorMap = {
  spring: '봄 웜톤', summer: '여름 쿨톤', autumn: '가을 웜톤', winter: '겨울 쿨톤'
};

const ProductInfoBox = ({
  product,
  selectedOption,
  setSelectedOption,
  quantity,
  setQuantity,
  handleAddToCart,
  handleBuyNow
}) => {
  // 판매 상태 체크 (품절/판매중지 여부)
  const isSoldOut = product.status === '품절' || product.status === 'SOLD_OUT';
  const isStop = product.status === '판매중지' || product.status === 'STOP';
  const isUnavailable = isSoldOut || isStop; // 구매 불가 상태 통합

  // 선택된 옵션에 따른 추가금 계산
  const selectedOpt = product.options?.find(opt => opt.optionNo === Number(selectedOption));
  const unitPrice = product.prdPrice + (selectedOpt?.addPrice || 0);
  const totalPrice = unitPrice * quantity;

  const navigate = useNavigate();

  // 태그 클릭 시 해당 키워드로 검색 페이지 이동
  const handleTagClick = (keyword) => {
    navigate(`/product?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="info-box">
      <h2 className="product-name">{product.prdName}</h2>
      {/* 별점 및 리뷰 수 */}
      <p className="product-rating">⭐ {product.averageRating} ({product.reviewCount})</p>
      
      {/* 태그 렌더링 영역 */}
      <div className="tag-container">
        {product.skinTypes?.map(type => {
            const label = skinTypeMap[type] || type;
            return <span key={type} className="tag-badge" onClick={() => handleTagClick(label)}># {label}</span>
        })}
        {product.skinConcerns?.map(concern => {
            const label = skinConcernMap[concern] || concern;
            return <span key={concern} className="tag-badge" onClick={() => handleTagClick(label)}># {label}</span>
        })}
        {product.personalColors?.map(color => {
            const label = personalColorMap[color] || color;
            return <span key={color} className="tag-badge" onClick={() => handleTagClick(label)}># {label}</span>
        })}
      </div>

      {/* 가격 렌더링 영역 */}
      <p className="product-price"> {unitPrice.toLocaleString()}원 </p>

      {/* 옵션 선택 셀렉트 박스 (옵션이 있을 경우에만 표시) */}
      {product.options && product.options.length > 0 && (
        <div>
          <label htmlFor="product-option" className="visually-hidden">상품 옵션 선택</label>
          <select
            id="product-option"
            className="product-select"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}>
            <option value="">옵션을 선택하세요</option>
            {product.options.map((opt) => (
              <option key={opt.optionNo} value={opt.optionNo}>
                {opt.optionValue}
                {opt.addPrice > 0 ? ` (+${opt.addPrice.toLocaleString()}원)` : ''}
                (재고: {opt.stock})
                {opt.stock <= 0 ? ' (품절)' : ''}
              </option>
            ))}
          </select>

          {/* 품절 임박 알림 메시지 */}
          {selectedOpt && selectedOpt.stock > 0 && selectedOpt.stock < 5 && (
            <div style={{ 
              color: '#e74c3c', 
              fontSize: '16px', 
              fontWeight: '700', 
              marginTop: '8px',
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
      )}

      {/* 상품 수량 조절 및 총 가격 */}
      <div>
        <label htmlFor="product-quantity" className="visually-hidden">상품 수량</label>
        <div className="qty-control">
          <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
          <input
            type="number"
            className="qty-input"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          />
          <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>
      </div>

      <div className="total-price-box">
        <span className="total-price-label">총 상품 금액</span>
        <span className="total-price-value">{totalPrice.toLocaleString()}원</span>
      </div>

      {/* 구매 통계 (유사 피부 타입 리뷰 요약) */}
      <div>
         <SimilarSkinReview productId={product.prdNo} />
      </div>
      
      {/* 액션 버튼 그룹 (장바구니 / 바로구매) */}
      <div className="btn-group">
        <ProductButton
          onClick={handleAddToCart}
          disabled={isUnavailable}
          style={{ opacity: isUnavailable ? 0.5 : 1, flex: 1 }}
        >
          {isSoldOut ? '품절' : (isStop ? '판매 중지' : '장바구니')}
        </ProductButton>

        {!isUnavailable && (
          <ProductButton
            primary
            onClick={handleBuyNow}
            style={{ flex: 1 }}
          >
            바로구매
          </ProductButton>
        )}
      </div>
    </div>
  );
};

export default ProductInfoBox;