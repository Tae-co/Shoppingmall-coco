import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/product/ProductDetailPage.css';

/**
 * [최근 본 상품] 우측 사이드바 컴포넌트
 * - 역할: LocalStorage에서 'recentViewed' 데이터를 읽어와 목록으로 표시
 * - 기능: 현재 보고 있는 상품을 저장하는 로직도 포함
 */
const RecentProductSidebar = ({ currentProduct }) => {
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    if (!currentProduct) return;

    const currentItem = {
      prdNo: currentProduct.prdNo,
      prdName: currentProduct.prdName,
      imageUrl: currentProduct.imageUrls?.[0] || '',
      prdPrice: currentProduct.prdPrice
    };

    let items = JSON.parse(localStorage.getItem('recentViewed')) || [];
    // 중복 제거 및 최신순 정렬
    items = items.filter(item => item.prdNo !== currentProduct.prdNo);
    items.unshift(currentItem);
    // 최대 3개 유지
    if (items.length > 3) items = items.slice(0, 3);

    localStorage.setItem('recentViewed', JSON.stringify(items));
    setRecentItems(items);
  }, [currentProduct]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <aside className="right-sidebar">
      <div className="sticky-box">
        <h3>최근 본 상품</h3>
        {recentItems.length === 0 ? (
          <p className="empty-msg">내역 없음</p>
        ) : (
          <div className="recent-list">
            {recentItems.map((item) => (
              <Link to={`/products/${item.prdNo}`} key={item.prdNo} className="recent-item">
                <img src={item.imageUrl} alt={item.prdName} />
                <div className="recent-info">
                  <span className="name">{item.prdName}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
        <button className="top-btn" onClick={scrollToTop}>TOP ▲</button>
      </div>
    </aside>
  );
};

export default RecentProductSidebar;