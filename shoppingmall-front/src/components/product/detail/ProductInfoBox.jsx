import React from 'react';
import styled from 'styled-components';
import ProductButton from '../ProductButton';
import SimilarSkinReview from '../../../features/SimilarSkinReview';

// 스타일
const InfoBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ProductName = styled.h2`
  font-size: 28px;
  font-weight: bold;
`;

const ProductRating = styled.p`
  font-size: 16px;
  color: #555;
`;

// 시각적으로만 라벨을 숨기는 스타일
const VisuallyHiddenLabel = styled.label`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const ProductPrice = styled.p`
  font-size: 24px;
  font-weight: bold;
  border-top: 1px solid #eee;
  padding-top: 16px;
`;

// 폼 공통 스타일
const CommonFormStyle = `
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
`;

const SelectBox = styled.select`
  ${CommonFormStyle}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const TagContainer = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 10px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  font-size: 12px;
  font-weight: 500;
  background: #f0f0f0;
  color: #555;
  padding: 4px 8px;
  border-radius: 4px;
`;

// 수량 조절 컨테이너 스타일
const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 150px; /* 적절한 너비 설정 */
  margin-bottom: 20px;
`;

const QuantityBtn = styled.button`
  width: 40px;
  height: 40px;
  background: #f9f9f9;
  border: none;
  font-size: 18px;
  cursor: pointer;
  &:hover { background: #eee; }
`;

const QuantityValue = styled.input`
  flex: 1;
  text-align: center;
  border: none;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  height: 40px;
  font-size: 16px;
  width: 100%;
  &:focus { outline: none; }
  /* Firefox 및 크롬 등에서 기본 화살표(스핀 버튼) 제거 */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
    
  /* Firefox 전용 설정 */
  -moz-appearance: textfield;
`;

const skinTypeMap = { dry: '건성', oily: '지성', combination: '복합성', sensitive: '민감성' };
const skinConcernMap = {
  hydration: '수분', moisture: '보습', brightening: '미백', tone: '피부톤',
  soothing: '진정', sensitive: '민감', uv: '자외선차단', wrinkle: '주름',
  elasticity: '탄력', pores: '모공'
};
const personalColorMap = {
  cool: '쿨톤',
  warm: '웜톤',
  neutral: '뉴트럴톤'
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

  // 상태 확인 로직
  const isSoldOut = product.status === '품절' || product.status === 'SOLD_OUT';
  const isStop = product.status === '판매중지' || product.status === 'STOP';
  const isUnavailable = isSoldOut || isStop;

  return (
    <InfoBox>
      <ProductName>{product.prdName}</ProductName>
      <ProductRating>⭐ {product.averageRating} ({product.reviewCount})</ProductRating>
      <TagContainer>
        {product.skinTypes?.map(type => (
          <Tag key={type}># {skinTypeMap[type] || type}</Tag>
        ))}
        {product.skinConcerns?.map(concern => (
          <Tag key={concern}># {skinConcernMap[concern] || concern}</Tag>
        ))}
        {product.personalColors?.map(color => (
          <Tag key={color}># {personalColorMap[color] || color}</Tag>
        ))}
      </TagContainer>
      <ProductPrice>{product.prdPrice.toLocaleString()}원</ProductPrice>

      {/* --- 옵션 선택 --- */}
      {product.options && product.options.length > 0 && (
        <div>
          <VisuallyHiddenLabel htmlFor="product-option">상품 옵션 선택</VisuallyHiddenLabel>
          <SelectBox
            id="product-option"
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
          </SelectBox>
        </div>
      )}

      {/* --- 수량 --- */}
      <div>
        <VisuallyHiddenLabel htmlFor="product-quantity">상품 수량</VisuallyHiddenLabel>
        <QuantityControl>
          <QuantityBtn onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</QuantityBtn>
          <QuantityValue
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          />
          <QuantityBtn onClick={() => setQuantity(quantity + 1)}>+</QuantityBtn>
        </QuantityControl>
      </div>

      <div>
         <SimilarSkinReview productId={product.prdNo} />
      </div>
      {/* 장바구니 버튼 */}
      
      <ButtonGroup>
        <ProductButton
          onClick={handleAddToCart}
          disabled={isUnavailable} // 비활성화
          style={{ opacity: isUnavailable ? 0.5 : 1, flex: 1 }}
        >
          {isSoldOut ? '품절' : (isStop ? '판매 중지' : '장바구니')}
        </ProductButton>

        {/* 바로구매 버튼 */}
        {!isUnavailable && ( // 품절/판매중지가 아닐 때만 표시
          <ProductButton
            primary // 검은색 배경 스타일 적용
            onClick={handleBuyNow}
            style={{ flex: 1 }} // 너비 반반 차지
          >
            바로구매
          </ProductButton>
        )}
      </ButtonGroup>
    </InfoBox>
  );
};

export default ProductInfoBox;
