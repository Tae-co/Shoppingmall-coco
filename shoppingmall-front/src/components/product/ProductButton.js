import React from 'react';
import '../../css/product/ProductButton.css'; // CSS 임포트

const ProductButton = ({ primary, className, ...props }) => {
  const btnClass = `product-btn ${primary ? 'primary' : ''} ${className || ''}`;

  return <button className={btnClass} {...props} />;
};

export default ProductButton;