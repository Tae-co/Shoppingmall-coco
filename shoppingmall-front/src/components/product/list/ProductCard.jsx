import { Link } from 'react-router-dom';
import styled from 'styled-components';
import ProductButton from '../ProductButton';


// 스타일 컴포넌트
const CardLink = styled(Link)`
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
  text-decoration: none;
  color: black;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 4px;
`;

const CardContent = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const ProductName = styled.h3`
  font-size: 17px;
  font-weight: 600;
  margin-top: 10px;
`;

const ProductRating = styled.p`
  font-size: 14px;
  color: #666;
  margin-top: 8px;
`;

// 피부 타입 태그
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
  white-space: nowrap;
  flex-shrink: 0;
`;

// 간단 리뷰
const SimpleReview = styled.p`
  font-size: 13px;
  color: #555;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
  font-style: italic;

  /* --- 말줄임표 스타일 --- */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ProductPrice = styled.p`
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
  
  margin-top: auto; 
  padding-top: 10px;
`;

// 스타일 추가: 이미지 래퍼 및 품절 오버레이
const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
`;

const SoldOutOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); // 반투명 검정
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
  border-radius: 4px;
  z-index: 1;
`;

const skinConcernMap = {
  hydration: '수분',
  moisture: '보습',
  brightening: '미백',
  tone: '피부톤',
  soothing: '진정',
  sensitive: '민감',
  uv: '자외선차단',
  wrinkle: '주름',
  elasticity: '탄력',
  pores: '모공'
};

const skinTypeMap = {
  dry: '건성',
  oily: '지성',
  combination: '복합성',
  sensitive: '민감성'
};

const personalColorMap = {
  cool: '쿨톤',
  warm: '웜톤',
  neutral: '뉴트럴톤'
};



const ProductCard = ({ product, onAddToCart }) => {
  const isSoldOut = product.status === '품절' || product.status === 'SOLD_OUT';
  const isStop = product.status === '판매중지' || product.status === 'STOP';

  return (
    <CardLink to={isSoldOut || isStop ? '#' : `/products/${product.prdNo}`} style={{ cursor: isSoldOut ? 'default' : 'pointer' }}>
      <ImageWrapper>
        <ProductImage src={product.imageUrl} alt={product.prdName} loading="lazy" />
        {/* 품절/판매중지 시 오버레이 표시 */}
        {(isSoldOut || isStop) && (
          <SoldOutOverlay>
            {isSoldOut ? 'SOLD OUT' : '판매 중지'}
          </SoldOutOverlay>
        )}
      </ImageWrapper>

      <CardContent>
        <ProductName>{product.prdName}</ProductName>
        <ProductRating>
          ⭐ {product.averageRating} ({product.reviewCount})
        </ProductRating>
        <TagContainer>
          {/* SkinType 태그 */}
          {product.skinTypes?.map(type => (
            <Tag key={type}># {skinTypeMap[type] || type}</Tag>
          ))}
          {/* SkinConcern 태그 */}
          {product.skinConcerns?.map(concern => (
            <Tag key={concern}># {skinConcernMap[concern] || concern}</Tag>
          ))}
          {/* personalColor 태그 */}
          {product.personalColors?.map(color => (
            <Tag key={color}># {personalColorMap[color] || color}</Tag>
          ))}
        </TagContainer>
        <ProductPrice>{product.prdPrice.toLocaleString()}원</ProductPrice>
        <SimpleReview>{product.simpleReview}</SimpleReview>

        <ProductButton
          onClick={(e) => {
            if (isSoldOut || isStop) {
              e.preventDefault();
              alert("구매할 수 없는 상품입니다.");
            } else {
              onAddToCart(e);
            }
          }}
          $primary
          disabled={isSoldOut || isStop}
          style={{ marginTop: '12px', opacity: (isSoldOut || isStop) ? 0.5 : 1 }}
        >
          {isSoldOut ? '품절' : (isStop ? '판매 중지' : '장바구니 담기')}
        </ProductButton>
      </CardContent>
    </CardLink>
  );
};

export default ProductCard;
