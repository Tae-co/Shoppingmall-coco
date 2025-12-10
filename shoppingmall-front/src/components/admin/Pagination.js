import React from 'react';
import PropTypes from 'prop-types';
import '../../css/admin/AdminComponents.css';

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // 페이지 번호 생성 로직
  const getPageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= 10) {
      // 페이지가 10개 이하이면 전체 표시
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // 페이지가 많을 경우: [1] ... [current-2] [current-1] [current] [current+1] [current+2] ... [last]
      
      // 항상 첫 페이지 추가
      pageNumbers.push(1);

      // 현재 페이지 주변 범위 계산
      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);

      // 예외 처리: 시작 부분에 가까울 때 (1 2 3 4 5 ... 24)
      if (currentPage <= 4) {
        endPage = 5;
        startPage = 2;
      }
      // 예외 처리: 끝 부분에 가까울 때 (1 ... 20 21 22 23 24)
      if (currentPage >= totalPages - 3) {
        startPage = totalPages - 4;
        endPage = totalPages - 1;
      }

      // 앞쪽 줄임표 (...)
      if (startPage > 2) {
        pageNumbers.push('...');
      }

      // 중간 범위 페이지들 추가
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // 뒤쪽 줄임표 (...)
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }

      // 항상 마지막 페이지 추가
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <nav className="pagination-nav">
      {/* 이전 버튼 */}
      <button 
        className="page-btn"
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
      >
        &lt;
      </button>

      {/* 페이지 번호 렌더링 */}
      {getPageNumbers().map((number, index) => (
        <React.Fragment key={index}>
          {number === '...' ? (
            <span className="page-ellipsis">...</span>
          ) : (
            <button
              onClick={() => onPageChange(number)}
              className={`page-btn ${number === currentPage ? 'active' : ''}`}
            >
              {number}
            </button>
          )}
        </React.Fragment>
      ))}

      {/* 다음 버튼 */}
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

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired 
};

export default Pagination;