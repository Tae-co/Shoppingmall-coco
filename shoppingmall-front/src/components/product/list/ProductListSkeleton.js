import React from 'react';
import '../../../css/product/Skeleton.css';

const ITEMS_PER_PAGE = 6; 

const ProductListSkeleton = () => (
  <div className="skeleton-list-grid">
    {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
      <div key={index} className="skeleton-card">
        <div className="skeleton-base skeleton-list-img" />
        <div className="skeleton-content">
          <div className="skeleton-base skeleton-text" style={{ width: '80%', marginTop: '10px' }} />
          <div className="skeleton-base skeleton-text" style={{ width: '50%', marginTop: '10px' }} />
        </div>
      </div>
    ))}
  </div>
);

export default ProductListSkeleton;