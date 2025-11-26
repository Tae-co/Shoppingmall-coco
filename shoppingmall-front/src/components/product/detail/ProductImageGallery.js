import React, { useState, useEffect } from 'react';
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
      <img 
        className="main-image"
        src={selectedImage} 
        alt={productName} 
      />
      
      {imageUrls.length > 1 && (
        <div className="thumbnail-container">
          {imageUrls.map((imgUrl, index) => (
            <img
              key={index}
              className={`thumbnail ${imgUrl === selectedImage ? 'active' : ''}`}
              src={imgUrl}
              alt={`${productName} 썸네일 ${index + 1}`}
              onClick={() => setSelectedImage(imgUrl)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;