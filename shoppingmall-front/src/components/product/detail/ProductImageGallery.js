import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../../css/product/ProductImageGallery.css';

const ProductImageGallery = ({ productName, imageUrls }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (imageUrls && imageUrls.length > 0) {
      setSelectedImage(imageUrls[0]);
    }
  }, [imageUrls]);

  if (!imageUrls || imageUrls.length === 0) {
    return <div className="image-gallery-box" />;
  }

  return (
    <div className="image-gallery-box">
      {/* 메인 이미지 */}
      <img
        className="main-image"
        src={selectedImage || ''} // selectedImage가 null일 경우 대비
        alt={productName}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/prd_placeholder.png';
        }}
      />

      {/* 썸네일 리스트 */}
      {imageUrls.length > 1 && (
        <div className="thumbnail-container">
          {imageUrls.map((imgUrl, index) => (
            <img
              key={index}
              className={`thumbnail ${imgUrl === selectedImage ? 'active' : ''}`}
              src={imgUrl}
              alt={`${productName} 썸네일 ${index + 1}`}
              onClick={() => setSelectedImage(imgUrl)}

              // 접근성 오류 해결: 키보드 이벤트, 역할, 탭 인덱스 추가
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedImage(imgUrl);
                }
              }}
              role="button"
              tabIndex={0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Props 타입 검증 오류 해결
ProductImageGallery.propTypes = {
  productName: PropTypes.string,
  imageUrls: PropTypes.arrayOf(PropTypes.string)
};

// 기본값 설정
ProductImageGallery.defaultProps = {
  productName: '',
  imageUrls: []
};

export default ProductImageGallery;