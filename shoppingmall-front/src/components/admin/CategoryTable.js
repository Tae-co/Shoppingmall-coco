import React from 'react';
import '../../css/admin/CategoryTable.css';

import editIcon from '../../images/edit.svg';
import deleteIcon from '../../images/delete.svg';

function CategoryTable({ categories, onEdit, onDelete }) {
  const PROTECTED_IDS = [1, 2, 3, 4];

  // 날짜 오름차순 정렬 (오래된 순 -> 최근 수정이 맨 뒤로)
  const sortByDateAsc = (a, b) => {
    if (!a.modDate) return -1;
    if (!b.modDate) return 1;
    return new Date(a.modDate) - new Date(b.modDate);
  };

  const renderCategoryRows = () => {
    // 대분류 필터링
    const parents = categories.filter(cat => !cat.parentCategory && !cat.parentCategoryNo);

    return parents.map(parent => {
      // 소분류 찾기 & 날짜 정렬
      const children = categories.filter(cat => {
          const parentId = cat.parentCategory ? cat.parentCategory.categoryNo : cat.parentCategoryNo;
          return parentId === parent.categoryNo;
      }).sort(sortByDateAsc);

      const isProtected = PROTECTED_IDS.includes(parent.categoryNo);

      return (
        <React.Fragment key={parent.categoryNo}>
          {/* 대분류 행 */}
          <tr className="category-row parent">
            <td>{parent.categoryNo}</td>
            <td className="category-name-cell">{parent.categoryName}</td>
            <td>
              {!isProtected && (
                <>
                  <button className="icon-btn edit" onClick={() => onEdit(parent)} title="수정">
                    <img src={editIcon} alt="수정" />
                  </button>
                  <button className="icon-btn delete" onClick={() => onDelete(parent)} title="삭제">
                    <img src={deleteIcon} alt="삭제" />
                  </button>
                </>
              )}
            </td>
          </tr>

          {/* 소분류 행 */}
          {children.map(child => (
            <tr key={child.categoryNo} className="category-row child">
              <td className="id-cell-child">{child.categoryNo}</td>
              <td className="category-name-cell child">└ {child.categoryName}</td>
              <td>
                <button className="icon-btn edit" onClick={() => onEdit(child)} title="수정">
                  <img src={editIcon} alt="수정" />
                </button>
                <button className="icon-btn delete" onClick={() => onDelete(child)} title="삭제">
                  <img src={deleteIcon} alt="삭제" />
                </button>
              </td>
            </tr>
          ))}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="table-responsive">
      <table className="admin-table category-table">
        <thead>
          <tr>
            <th style={{ width: '100px' }}>ID</th>
            <th>카테고리 이름</th>
            <th style={{ width: '170px' }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {renderCategoryRows()}
        </tbody>
      </table>
    </div>
  );
}

export default CategoryTable;