import React from 'react';
import '../../css/admin/AdminComponents.css';

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="pagination-nav">
      <button 
        className="page-btn"
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
      >
        &lt;
      </button>

      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`page-btn ${number === currentPage ? 'active' : ''}`}
        >
          {number}
        </button>
      ))}

      <button 
        className="page-btn"
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </nav>
  );
}

export default Pagination;