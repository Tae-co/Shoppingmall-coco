import React from 'react';
import '../../../css/product/Skeleton.css';

const ITEMS_PER_PAGE = 6; 

const ProductListSkeleton = () => {
  // 인덱스 대신 사용할 고유 ID 배열을 생성 (예: ['skeleton-0', 'skeleton-1', ...])
  const skeletonItems = Array.from({ length: ITEMS_PER_PAGE }, (_, i) => `skeleton-${i}`);

  return (
    <div className="skeleton-list-grid">
      {/* map의 두 번째 인자가 아니라, 배열의 값을 key로 사용 */}
      {skeletonItems.map((keyStr) => (
        <div key={keyStr} className="skeleton-card">
          <div className="skeleton-base skeleton-list-img" />
          <div className="skeleton-content">
            <div className="skeleton-base skeleton-text" style={{ width: '80%', marginTop: '10px' }} />
            <div className="skeleton-base skeleton-text" style={{ width: '50%', marginTop: '10px' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductListSkeleton;