import React, { useState } from 'react';
import styled from 'styled-components';
import ProductReviews from '../../../features/ProductReviews';

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

// 스타일 컴포넌트
const TabContainer = styled.div`
  margin-top: 60px;
  border-top: 2px solid #333;
`;

const TabButtons = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 15px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  
  border-bottom: ${props => (props.$active ? '3px solid #333' : '3px solid transparent')};
  color: ${props => (props.$active ? '#333' : '#888')};
  
  transition: border-color 0.2s, color 0.2s;

  &:hover {
    color: #333;
  }
`;

const TabContent = styled.div`
  padding: 20px;
  min-height: 200px;
  line-height: 1.7;
  font-size: 16px;
`;

const ProductTabs = ({ product }) => {
  const [currentTab, setCurrentTab] = useState('details');

  return (
    <TabContainer>
      <TabButtons>
        <TabButton 
          $active={currentTab === 'details'} 
          onClick={() => setCurrentTab('details')}
        >
          상세정보
        </TabButton>
        <TabButton 
          $active={currentTab === 'reviews'} 
          onClick={() => setCurrentTab('reviews')}
        >
          리뷰 ({product.reviewCount})
        </TabButton>
        <TabButton 
          $active={currentTab === 'howToUse'} 
          onClick={() => setCurrentTab('howToUse')}
        >
          사용방법
        </TabButton>
        <TabButton 
          $active={currentTab === 'shipping'} 
          onClick={() => setCurrentTab('shipping')}
        >
          배송/교환
        </TabButton>
      </TabButtons>
      
      <TabContent>
        {currentTab === 'details' && (
          <div>
            <h3>상품 상세정보</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>
              {product.description}
            </p>
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
            <p style={{ whiteSpace: 'pre-wrap' }}>
              {product.howToUse}
            </p>
          </div>
        )}
        {currentTab === 'shipping' && (
          <div>
            {shippingInfo}
          </div>
        )}
      </TabContent>
    </TabContainer>
  );
};

export default ProductTabs;
