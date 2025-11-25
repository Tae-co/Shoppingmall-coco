import React from 'react';
import styled from 'styled-components';
import { Table, Th, Td, Button } from '../../styles/admincommon';

// 버튼 스타일 정의
const ActionButton = styled(Button)`
  padding: 5px 10px;
  font-size: 12px;
  margin-right: 5px;
  
  background: ${props => (props.$danger ? props.theme.colors.danger : '#eee')};
  color: ${props => (props.$danger ? 'white' : props.theme.colors.text)};
`;

const TableContainer = styled(Table)`
  min-width: 0;
`;

function CategoryTable({ categories, onEdit, onDelete }) {

  // 삭제가 불가능한 고정 카테고리 ID 목록
  const PROTECTED_IDS = [1, 2, 3, 4];
  
  const renderCategoryRows = () => {
    // 대분류 필터링
    const parents = categories.filter(cat => !cat.parentCategory && !cat.parentCategoryNo);
    
    return parents.map(parent => {
      // 자식 찾기
      const children = categories.filter(cat => {
          const parentId = cat.parentCategory ? cat.parentCategory.categoryNo : cat.parentCategoryNo;
          return parentId === parent.categoryNo;
      });

      // 현재 대분류가 보호 대상인지 확인
      const isProtected = PROTECTED_IDS.includes(parent.categoryNo);

      return (
        <React.Fragment key={parent.categoryNo}>
          {/* 대분류 */}
          <tr style={{ fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>
            <Td>{parent.categoryNo}</Td>
            <Td style={{ textAlign: 'left', paddingLeft: '20px' }}>{parent.categoryName}</Td>
            <Td>
              {/* 보호 대상이 아닐 때만 수정과 삭제 버튼 모두 표시 */}
              {!isProtected && (
                <>
                  <ActionButton onClick={() => onEdit(parent)}>수정</ActionButton>
                  <ActionButton $danger onClick={() => onDelete(parent)}>삭제</ActionButton>
                </>
              )}
              {/* 보호 대상이면 빈칸 표시 */}
              {isProtected && <span style={{ fontSize: '12px', color: '#aaa' }}></span>}
            </Td>
          </tr>

          {/* 소분류 */}
          {children.map(child => (
            <tr key={child.categoryNo}>
              <Td style={{ color: '#888' }}>{child.categoryNo}</Td>
              <Td style={{ textAlign: 'left', paddingLeft: '50px' }}>└ {child.categoryName}</Td>
              <Td>
                <ActionButton onClick={() => onEdit(child)}>수정</ActionButton>
                <ActionButton $danger onClick={() => onDelete(child)}>삭제</ActionButton>
              </Td>
            </tr>
          ))}
        </React.Fragment>
      );
    });
  };

  return (
    <TableContainer>
      <thead>
        <tr>
          <Th style={{ width: '100px' }}>ID</Th>
          <Th>카테고리 이름</Th>
          <Th style={{ width: '150px' }}>관리</Th>
        </tr>
      </thead>
      <tbody>
        {renderCategoryRows()}
      </tbody>
    </TableContainer>
  );
}

export default CategoryTable;