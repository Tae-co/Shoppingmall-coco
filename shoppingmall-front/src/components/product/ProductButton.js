import React from 'react';
import PropTypes from 'prop-types';
import '../../css/product/ProductButton.css'; // CSS 임포트

const ProductButton = ({ primary, className, ...props }) => {
  const btnClass = `product-btn ${primary ? 'primary' : ''} ${className || ''}`;

  return <button className={btnClass} {...props} />;
};

// Props 타입 정의
ProductButton.propTypes = {
  primary: PropTypes.bool,
  className: PropTypes.string
};

// 기본값 설정
ProductButton.defaultProps = {
  primary: false,
  className: ''
};

export default ProductButton;