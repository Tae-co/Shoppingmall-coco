import React, { useState } from 'react';
import ProductReviews from '../../../features/ProductReviews';
import '../../../css/product/ProductTabs.css';

const shippingInfo = (
  <div>
    <h3>배송 안내</h3>
    <p>
      - 배송비: 기본 배송비 3,000원 (30,000원 이상 구매 시 무료배송)
      <br />
      - 배송 기간: 영업일 기준 2~3일 소요됩니다. (주말/공휴일 제외)
    </p>
    <br />
    <h3>교환 및 반품 안내</h3>
    <p>
      - 단순 변심으로 인한 교환/반품은 상품 수령 후 7일 이내에 가능합니다. (왕복 배송비 6,000원 고객 부담)
      <br />
      - 상품 불량 또는 오배송의 경우, 수령 후 30일 이내에 교환/반품이 가능합니다. (배송비 무료)
    </p>
  </div>
);

const ProductTabs = ({ product }) => {
  const [currentTab, setCurrentTab] = useState('details');

  return (
    <div className="product-tab-container">
      <div className="product-tab-buttons">
        {['details', 'reviews', 'howToUse', 'shipping'].map((tab) => {
          const label = {
            details: '상세정보',
            reviews: `리뷰 (${product.reviewCount})`,
            howToUse: '사용방법',
            shipping: '배송/교환'
          }[tab];

          return (
            <button 
              key={tab}
              className={`product-tab-btn ${currentTab === tab ? 'active' : ''}`}
              onClick={() => setCurrentTab(tab)}
            >
              {label}
            </button>
          );
        })}
      </div>
      
      <div className="product-tab-content">
        {currentTab === 'details' && (
          <div>
            <h3>상품 상세정보</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
          </div>
        )}
        {currentTab === 'reviews' && (
          <div>
            <ProductReviews productNo={product.prdNo} />
          </div>
        )}
        {currentTab === 'howToUse' && (
          <div>
            <h3>사용방법</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{product.howToUse}</p>
          </div>
        )}
        {currentTab === 'shipping' && (
          <div>{shippingInfo}</div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;