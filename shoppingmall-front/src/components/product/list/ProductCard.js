import React from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import ProductButton from '../ProductButton';
import '../../../css/product/ProductCard.css';

const skinConcernMap = {
  hydration: '수분', moisture: '보습', brightening: '미백', tone: '피부톤',
  soothing: '진정', sensitive: '민감', uv: '자외선차단', wrinkle: '주름',
  elasticity: '탄력', pores: '모공'
};

const skinTypeMap = {
  all: '모든 피부', dry: '건성', oily: '지성', combination: '복합성', sensitive: '민감성'
};

const personalColorMap = {
  spring: '봄 웜톤', summer: '여름 쿨톤', autumn: '가을 웜톤', winter: '겨울 쿨톤'
};

const ProductCard = ({ product, onAddToCart }) => {
  const isSoldOut = product.status === '품절' || product.status === 'SOLD_OUT';
  const isStop = product.status === '판매중지' || product.status === 'STOP';
  const navigate = useNavigate();

  const handleTagClick = (e, keyword) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product?q=${encodeURIComponent(keyword)}`);
  };

  // 키보드 엔터키 지원 (접근성)
  const handleTagKeyDown = (e, keyword) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleTagClick(e, keyword);
    }
  };

  // 품절/판매중지 시 링크 비활성화
  const linkTo = (isSoldOut || isStop) ? '#' : `/products/${product.prdNo}`;
  const linkStyle = (isSoldOut || isStop) ? { cursor: 'default' } : {};

  return (
    <Link to={linkTo} className="product-card-link" style={linkStyle}>
      <div className="product-card-img-wrapper">
        <img className="product-card-img" src={product.imageUrl} alt={product.prdName} loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/prd_placeholder.png';
          }} />
        {(isSoldOut || isStop) && (
          <div className="product-card-overlay">
            {isSoldOut ? 'SOLD OUT' : '판매 중지'}
          </div>
        )}
      </div>

      <div className="product-card-content">
        <h3 className="product-card-name">{product.prdName}</h3>
        <p className="product-card-rating">
          ⭐ {product.reviewCount >= 5 ? product.averageRating : "평가중"} ({product.reviewCount})
        </p>

        <div className="product-card-tags">
          {product.skinTypes?.map(type => (
            <span 
              key={type} 
              className="product-card-tag" 
              onClick={(e) => handleTagClick(e, skinTypeMap[type] || type)}
              onKeyDown={(e) => handleTagKeyDown(e, skinTypeMap[type] || type)}
              role="button"
              tabIndex={0}
            >
              # {skinTypeMap[type] || type}
            </span>
          ))}
          {product.skinConcerns?.map(concern => (
            <span 
              key={concern} 
              className="product-card-tag" 
              onClick={(e) => handleTagClick(e, skinConcernMap[concern] || concern)}
              onKeyDown={(e) => handleTagKeyDown(e, skinConcernMap[concern] || concern)}
              role="button"
              tabIndex={0}
            >
              # {skinConcernMap[concern] || concern}
            </span>
          ))}
          {product.personalColors?.map(color => (
            <span 
              key={color} 
              className="product-card-tag" 
              onClick={(e) => handleTagClick(e, personalColorMap[color] || color)}
              onKeyDown={(e) => handleTagKeyDown(e, personalColorMap[color] || color)}
              role="button"
              tabIndex={0}
            >
              # {personalColorMap[color] || color}
            </span>
          ))}
        </div>

        <p className="product-card-price">{product.prdPrice.toLocaleString()}원</p>

        <ProductButton
          className="product-card-btn"
          primary
          disabled={isSoldOut || isStop}
          style={{ opacity: (isSoldOut || isStop) ? 0.5 : 1 }}
          onClick={(e) => {
            if (isSoldOut || isStop) {
              e.preventDefault();
              alert("구매할 수 없는 상품입니다.");
            } else {
              onAddToCart(e);
            }
          }}
        >
          {isSoldOut ? '품절' : (isStop ? '판매 중지' : '장바구니 담기')}
        </ProductButton>
      </div>
    </Link>
  );
};

// Props 타입 정의
ProductCard.propTypes = {
  product: PropTypes.shape({
    prdNo: PropTypes.number,
    status: PropTypes.string,
    imageUrl: PropTypes.string,
    prdName: PropTypes.string,
    averageRating: PropTypes.number,
    reviewCount: PropTypes.number,
    skinTypes: PropTypes.arrayOf(PropTypes.string),
    skinConcerns: PropTypes.arrayOf(PropTypes.string),
    personalColors: PropTypes.arrayOf(PropTypes.string),
    prdPrice: PropTypes.number
  }).isRequired,
  onAddToCart: PropTypes.func
};

export default ProductCard;
