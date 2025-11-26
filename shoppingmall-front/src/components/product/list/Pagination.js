import React from 'react';
import '../../../css/product/Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }
  
  return (
    <div className="pagination-container">
      <button 
        className="page-button"
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
      >
        이전
      </button>
      
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index + 1}
          className={`page-button ${index + 1 === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(index + 1)}
        >
          {index + 1}
        </button>
      ))}
      
      <button 
        className="page-button"
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
      >
        다음
      </button>
    </div>
  );
};

export default Pagination;
