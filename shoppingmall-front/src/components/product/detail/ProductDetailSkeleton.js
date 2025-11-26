import React from 'react';
import '../../../css/product/Skeleton.css';

const ProductDetailSkeleton = () => (
  <div className="skeleton-detail-top">
    <div className="skeleton-detail-image-box">
      <div className="skeleton-base skeleton-detail-img" />
    </div>
    <div className="skeleton-detail-info-box">
      <div className="skeleton-base skeleton-text" style={{ height: '30px', width: '70%' }} />
      <div className="skeleton-base skeleton-text" style={{ height: '20px', width: '30%' }} />
      <div className="skeleton-base skeleton-text" style={{ height: '24px', width: '40%', marginTop: '20px' }} />
      <div className="skeleton-base skeleton-text" style={{ height: '45px', width: '100%', marginTop: '20px' }} />
      <div className="skeleton-base skeleton-text" style={{ height: '45px', width: '100%' }} />
      <div className="skeleton-btn-group">
        <div className="skeleton-base" style={{ flex: 1, height: '50px' }} />
        <div className="skeleton-base" style={{ flex: 1, height: '50px' }} />
      </div>
    </div>
  </div>
);

export default ProductDetailSkeleton;