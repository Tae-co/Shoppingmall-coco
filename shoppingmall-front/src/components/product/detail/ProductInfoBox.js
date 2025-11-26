import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductButton from '../ProductButton';
import SimilarSkinReview from '../../../features/SimilarSkinReview';
import '../../../css/product/ProductInfoBox.css';

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
  const isSoldOut = product.status === '품절' || product.status === 'SOLD_OUT';
  const isStop = product.status === '판매중지' || product.status === 'STOP';
  const isUnavailable = isSoldOut || isStop;

  const selectedOpt = product.options?.find(opt => opt.optionNo === Number(selectedOption));
  const unitPrice = product.prdPrice + (selectedOpt?.addPrice || 0);
  const totalPrice = unitPrice * quantity;

  const navigate = useNavigate();

  const handleTagClick = (keyword) => {
    navigate(`/product?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="info-box">
      <h2 className="product-name">{product.prdName}</h2>
      <p className="product-rating">⭐ {product.averageRating} ({product.reviewCount})</p>
      
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

      <p className="product-price"> {unitPrice.toLocaleString()}원 </p>

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
              </option>
            ))}
          </select>
        </div>
      )}

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

      <div>
         <SimilarSkinReview productId={product.prdNo} />
      </div>
      
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