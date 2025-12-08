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
  const [showTopBtn, setShowTopBtn] = useState(false); // 스크롤 감지용 상태

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

  // 스크롤 감지하여 TOP 버튼 표시 여부 결정
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
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
        </div>
      </aside>

      {/* TOP 버튼: 사이드바와 별개로 렌더링 */}
      {showTopBtn && (
        <button className="fixed-top-btn" onClick={scrollToTop} aria-label="맨 위로 이동">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      )}
    </>
  );
};

export default RecentProductSidebar;