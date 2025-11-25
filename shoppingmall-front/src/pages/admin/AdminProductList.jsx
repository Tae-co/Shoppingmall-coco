import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Pagination from '../../components/admin/Pagination';
import Spinner from '../../components/admin/Spinner';
import { toast } from 'react-toastify';

import {
  Input, Select,
  Dashboard,
  DashCard,
  DashCardTitle,
  DashCardValue,
  ContentHeader,
  ContentTitle,
  Card,
  ButtonLink,
  Button,
  TableWrapper, Table, Th, Td
} from '../../styles/admincommon';

const LIMIT = 6;

const categories = [
  '스킨케어',
  '메이크업',
  '클렌징',
  '선케어'
];

const statuses = ['판매중', '품절'];

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const SearchInput = styled(Input)`
  flex: 1;
  width: auto;
  padding: 10px;
  font-size: 14px;
`;

const FilterSelect = styled(Select)`
  width: auto;
  min-width: 160px;
  padding: 10px;
  font-size: 14px;
`;

const ProductImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
`;

const StatusTag = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  /* 상태 텍스트에 따라 배경색 변경 */
  background-color: ${props => {
    switch (props.$status) {
      case '판매중': return '#28a745'; // 초록색
      case '품절': return '#dc3545';   // 빨간색
      case '판매중지': return '#fd7e14'; // 주황색
      default: return '#333';
    }
  }};
`;

const EditLink = styled(Link)`
  color: blue;
  text-decoration: none;
  margin-right: 10px;
  &:hover {
    text-decoration: underline;
  }
`;

const DeleteButton = styled.button`
  color: red;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  &:hover {
    text-decoration: underline;
  }
`;

const TableFooter = styled.div`
  text-align: center;
  padding: 20px 0;
  color: #555;
  font-size: 14px;
  border-top: 1px solid #eee;
`;

const Content = styled(Card)`
  padding: ${props => props.theme.spacing.large};
`;

function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  const [dashboardCounts, setDashboardCounts] = useState({
    inStock: 0,
    outOfStock: 0,
    totalStock: 0
  });

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage,
          size: LIMIT,
          sort: 'newest'
        });

        if (searchTerm) params.append('q', searchTerm);
        if (selectedCategory) params.append('categoryNo', selectedCategory);
        if (selectedStatus) params.append('status', selectedStatus);

        const response = await fetch(`http://localhost:8080/api/products?${params.toString()}`);
        if (!response.ok) throw new Error('네트워크 응답이 올바르지 않습니다.');

        const data = await response.json();
        setProducts(data.content);
        setTotalPages(data.totalPages);
        setTotalProducts(data.totalElements);
      } catch (error) {
        console.error("상품 목록 로드 실패:", error);
        toast.error("상품 목록을 불러오는 데 실패했습니다.");
      }
      setIsLoading(false);
    };

    // 대시보드 통계용 데이터 로드 및 계산 함수
    const loadStatistics = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/admin/stats');
        
        if (!response.ok) throw new Error('통계 로드 실패');

        const data = await response.json();

        // 백엔드에서 계산해준 값을 그대로 사용
        setDashboardCounts({
          inStock: data.inStockProducts,
          outOfStock: data.outOfStockProducts,
          totalStock: data.totalStock
        });

        setTotalProducts(data.totalProducts);

      } catch (error) {
        console.error("통계 로드 실패:", error);
      }
    };

    loadProducts();
    loadStatistics();
  }, [currentPage, searchTerm, selectedCategory, selectedStatus]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (product) => {
    const confirmMessage = `상품을 삭제하시겠습니까?\n\n상품명: ${product.prdName}\n\n이 작업은 취소할 수 없습니다.`;
    if (window.confirm(confirmMessage)) {
      try {
        const response = await fetch(`http://localhost:8080/api/admin/products/${product.prdNo}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('상품 삭제 실패');
        }

        toast.success(`'${product.prdName}' 상품이 삭제되었습니다.`);
        console.log(`[관리자] ${product.prdName} 삭제 완료`);

        setProducts(prevProducts => prevProducts.filter(p => p.prdNo !== product.prdNo));
        setTotalProducts(prev => prev - 1);

        if (products.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }

      } catch (error) {
        console.error("상품 삭제 실패:", error);
        toast.error("상품 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const dashboardData = {
    totalProducts: totalProducts,
    inStockProducts: dashboardCounts.inStock,
    outOfStockProducts: dashboardCounts.outOfStock,
    totalStockCount: dashboardCounts.totalStock
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      {/* --- 대시보드 --- */}
      <Dashboard>
        <DashCard>
          <DashCardTitle>전체 상품</DashCardTitle>
          <DashCardValue>{dashboardData.totalProducts}</DashCardValue>
        </DashCard>
        <DashCard>
          <DashCardTitle>판매중</DashCardTitle>
          <DashCardValue>{dashboardData.inStockProducts}</DashCardValue>
        </DashCard>
        <DashCard>
          <DashCardTitle>품절</DashCardTitle>
          <DashCardValue>{dashboardData.outOfStockProducts}</DashCardValue>
        </DashCard>
        <DashCard>
          <DashCardTitle>총 재고</DashCardTitle>
          <DashCardValue>{dashboardData.totalStockCount.toLocaleString()}</DashCardValue>
        </DashCard>
      </Dashboard>

      {/* --- 상품 목록 --- */}
      <Content>
        <ContentHeader>
          <ContentTitle>상품 목록</ContentTitle>
          <div>
            <Button onClick={() => window.location.reload()} style={{ marginRight: '10px' }}>🔄 새로고침</Button>
            <ButtonLink to="/admin/product/new" $primary>
              + 상품 등록
            </ButtonLink>
          </div>
        </ContentHeader>

        {/* 검색 / 필터 */}
        <FilterContainer>
          <SearchInput
            type="text"
            placeholder="상품명으로 검색..."
            value={searchTerm}
            onChange={handleFilterChange(setSearchTerm)}
          />

          <FilterSelect
            value={selectedCategory}
            onChange={handleFilterChange(setSelectedCategory)}
          >
            <option value="">전체 카테고리</option>
            {categories.map(categoryName => (
              <option key={categoryName} value={categoryName}>
                {categoryName}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={selectedStatus}
            onChange={handleFilterChange(setSelectedStatus)}
          >
            <option value="">전체 상태</option>
            {statuses.map(statusName => (
              <option key={statusName} value={statusName}>
                {statusName}
              </option>
            ))}
          </FilterSelect>
        </FilterContainer>

        {/* --- 상품 테이블 --- */}
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>이미지</Th>
                <Th>상품명</Th>
                <Th>카테고리</Th>
                <Th>가격</Th>
                <Th>재고</Th>
                <Th>상태</Th>
                <Th>관리</Th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.prdNo}>
                  <Td>{product.prdNo}</Td>
                  <Td><ProductImage src={product.imageUrl} alt={product.prdName} /></Td>
                  <Td>{product.prdName}</Td>
                  <Td>{product.categoryName}</Td>
                  <Td>{product.prdPrice.toLocaleString()}원</Td>
                  <Td>{product.stock}개</Td>
                  <Td>
                    <StatusTag $status={product.status}>
                      {product.status}
                    </StatusTag>
                  </Td>
                  <Td>
                    <EditLink to={`/admin/product/edit/${product.prdNo}`}>
                      수정
                    </EditLink>
                    <DeleteButton onClick={() => handleDelete(product)}>
                      삭제
                    </DeleteButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>

        <TableFooter>
          총 {totalProducts}개의 상품
        </TableFooter>

        {/* 페이지네이션*/}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />

      </Content>
    </>
  );
}

export default AdminProductList;