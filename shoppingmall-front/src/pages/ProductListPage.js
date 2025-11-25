import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ProductCard from '../components/product/list/ProductCard';
import ProductListSkeleton from '../components/product/list/ProductListSkeleton';
import Pagination from '../components/product/list/Pagination';
import ProductSidebar from '../components/product/list/ProductSidebar';
import ProductListHeader from '../components/product/list/ProductListHeader';
import { fetchWithAuth, getStoredMember, isLoggedIn  } from '../utils/api';

// 스타일 컴포넌트 정의
const PageContainer = styled.div`
  display: flex;
  padding: 20px 40px;
  max-width: 1280px;
  margin: 0 auto;

  /* 모바일 미디어 쿼리 추가 */
  @media (max-width: 768px) {
    /* 모바일에서는 좌우 여백 줄임 */
    padding: 10px;
  }
`;

const MainContent = styled.main`
  flex: 1;
`;

const ProductListGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px; /* 간격 살짝 넓힘 */
`;

// -------------------------------

function ProductListPage() {
  const [products, setProducts] = useState([]); // API 응답의 content 배열
  const [totalPages, setTotalPages] = useState(0); // 총 페이지 개수
  const [totalElements, setTotalElements] = useState(0); // 총 상품 개수

  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const closeButtonRef = useRef(null);
  const navigate = useNavigate(); // navigate 훅 사용

  // URL에서 현재 상태 읽어오기
  const searchTerm = searchParams.get('q') || '';
  const sortOrder = searchParams.get('sort') || 'popularity';
  const currentPage = Number(searchParams.get('page')) || 1;
  const activeFilters = {
    skinTypes: searchParams.getAll('skinType'),
    skinConcerns: searchParams.getAll('skinConcern'),
    personalColors: searchParams.getAll('personalColor')
  };

  // 전체 상품 목록은 처음에 한 번만 불러오기
  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      setIsLoading(true); // 로딩 시작

      try {
        // searchParams를 API URL 쿼리 스트링으로 변환
        const queryString = searchParams.toString();

        // 실제 API 호출
        const response = await fetch(`http://localhost:8080/api/products?${queryString}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('데이터를 불러오는 데 실패했습니다.');
        }

        const data = await response.json();

        setProducts(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } catch (error) { 
        if (error.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          console.error(error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts(); // 함수 실행

    return () => {
      controller.abort();
    };


  }, [searchParams]); // searchParams가 변경될 때마다 useEffect 다시 실행

  // isFilterOpen 상태가 변경될 때 포커스를 제어하는 useEffect
  useEffect(() => {
    if (isFilterOpen) {
      // 필터가 열리면, 0.1초 뒤 닫기 버튼에 포커스
      setTimeout(() => {
        closeButtonRef.current?.focus(); // .current가 실제 DOM 요소를 가리킴
      }, 100); // 100ms 딜레이
    }
  }, [isFilterOpen]); // isFilterOpen이 바뀔 때마다 실행

  // URL 파라미터를 업데이트하는 공통 함수
  const updateSearchParams = (newParams, resetPage = true) => {
    // 현재 URL의 모든 파라미터를 복사
    const params = new URLSearchParams(searchParams);

    // 새 파라미터 적용 (e.g., {q: '세럼'}, {sort: 'newest'})
    for (const [key, value] of Object.entries(newParams)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key); // 값이 없으면 URL에서 제거
      }
    }
    // 페이지 변경이 아닌 경우, 1페이지로 리셋
    if (resetPage) {
      params.set('page', '1');
    }
    setSearchParams(params);
  };

  // 배열(필터)을 위한 핸들러
  const handleFilterChange = (category, value) => {
    const currentValues = searchParams.getAll(category);
    let newValues;

    if (currentValues.includes(value)) {
      newValues = currentValues.filter(item => item !== value);
    } else {
      newValues = [...currentValues, value];
    }

    const params = new URLSearchParams(searchParams);
    params.delete(category);
    newValues.forEach(val => params.append(category, val));
    params.set('page', '1');
    setSearchParams(params);
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    updateSearchParams({ q: e.target.value });
  };

  // 정렬 변경 핸들러
  const handleSortChange = (e) => {
    updateSearchParams({ sort: e.target.value });
  };

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    updateSearchParams({ page: pageNumber.toString() }, false);
  };

  // 장바구니 담기 핸들러
  const handleAddToCart = async (e, product) => {
    // 상세 페이지 이동 방지
    e.preventDefault(); 
    e.stopPropagation();

    // 로그인 확인
    if (!isLoggedIn()) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    // 회원 정보 확인
    const member = getStoredMember();
    if (!member || !member.memNo) {
        alert('회원 정보를 찾을 수 없습니다.');
        return;
    }

    // 옵션 번호 확인
    if (!product.defaultOptionNo) {
        alert('옵션을 선택해야 하는 상품입니다. 상세 페이지에서 담아주세요.');
        navigate(`/products/${product.prdNo}`);
        return;
    }

    try {
        // API 호출
        const response = await fetchWithAuth('/coco/members/cart/items', {
            method: 'POST',
            body: JSON.stringify({
                memNo: member.memNo,
                optionNo: product.defaultOptionNo,
                cartQty: 1 // 목록에서는 기본 1개 담기
            })
        });

        if (response.ok) {
             if(window.confirm(`${product.prdName}을(를) 장바구니에 담았습니다.\n장바구니로 이동하시겠습니까?`)) {
                 navigate('/cart');
             }
        } else {
            const errorData = await response.json();
            alert(errorData.message || '장바구니 담기에 실패했습니다.');
        }
    } catch (error) {
        console.error(error);
        alert('오류가 발생했습니다.');
    }
  };

  // 로딩이 끝나고 상품을 화면에 그리기
  return (
    <PageContainer>
      <ProductSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        closeButtonRef={closeButtonRef}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />

      {/* --- 메인 상품 목록 --- */}
      <MainContent>
        <ProductListHeader
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          totalElements={totalElements}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onFilterToggle={() => setIsFilterOpen(true)}
        />

        {/* --- 로딩 / 비어있음 / 데이터 있음 분기 --- */}
        {isLoading ? (
          <ProductListSkeleton />
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888' }}>
            <h3>검색 결과가 없습니다</h3>
            <p>필터 조건을 다시 확인해 주세요.</p>
          </div>
        ) : (
          <>
            <ProductListGrid>
              {products.map((product) => (
                <ProductCard
                  key={product.prdNo}
                  product={product}
                  onAddToCart={(e) => handleAddToCart(e, product)}
                />
              ))}
            </ProductListGrid>

            {/* 페이지네이션 컴포넌트 */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </MainContent>
    </PageContainer>
  );
}

export default ProductListPage;
