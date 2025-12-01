import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../../components/product/list/ProductCard';
import ProductListSkeleton from '../../components/product/list/ProductListSkeleton';
import Pagination from '../../components/product/list/Pagination';
import ProductSidebar from '../../components/product/list/ProductSidebar';
import ProductListHeader from '../../components/product/list/ProductListHeader';
import { getStoredMember, isLoggedIn, STORAGE_KEYS } from '../../utils/api';
import '../../css/product/ProductListPage.css';

/**
 * [ProductListPage] 상품 목록 페이지 컴포넌트
 * 역할:
 * 1. 필터링(검색어, 카테고리, 피부타입 등)된 상품 목록 조회 및 표시
 * 2. 내 피부 맞춤 기능 제공 (회원 프로필 기반 자동 필터 설정)
 * 3. 장바구니 담기 기능 연동
 * 4. 페이지네이션 및 정렬 기능 처리
 */

// --- DB/마이페이지 데이터(한글) -> Shop 필터 ID 변환 맵 ---
const reverseSkinMap = {
  '건성': 'dry', '지성': 'oily', '복합성': 'combination', '민감성': 'sensitive'
};
const reverseConcernMap = {
  '수분': 'hydration', '보습': 'moisture', '미백': 'brightening', '피부톤': 'tone',
  '진정': 'soothing', '민감': 'sensitive', '자외선차단': 'uv', '주름': 'wrinkle',
  '탄력': 'elasticity', '모공': 'pores'
};
const reverseColorMap = {
  '봄 웜톤': 'spring', '여름 쿨톤': 'summer', '가을 웜톤': 'autumn', '겨울 쿨톤': 'winter'
};

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [userProfile, setUserProfile] = useState(null);
  const [isProfileMode, setIsProfileMode] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const closeButtonRef = useRef(null);
  const navigate = useNavigate();

  const searchTerm = searchParams.get('q') || '';
  const sortOrder = searchParams.get('sort') || 'popularity';
  const currentPage = Number(searchParams.get('page')) || 1;
  const activeFilters = {
    skinTypes: searchParams.getAll('skinType'),
    skinConcerns: searchParams.getAll('skinConcern'),
    personalColors: searchParams.getAll('personalColor')
  };

  // --- 프로필 정보 로드 ---
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoggedIn()) return;

      const member = getStoredMember();
      if (!member || !member.memNo) return;

      try {
        // 토큰 가져오기
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

        // 헤더에 Authorization 추가하여 요청
        const response = await axios.get(`http://localhost:8080/api/coco/members/profile/${member.memNo}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUserProfile(response.data);

      } catch (error) {
        console.error("프로필 로드 실패:", error);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 의도적으로 빈 배열 유지

  /**
   * 사용자 피부 프로필 정보를 기반으로 필터(쿼리 파라미터)를 자동 설정하는 함수
   */
  const applyProfileFilters = (profileData) => {
    if (!profileData) return;
    const newParams = new URLSearchParams(searchParams);
    let updated = false;

    newParams.delete('skinType');
    newParams.delete('skinConcern');
    newParams.delete('personalColor');

    if (profileData.skinType) {
      const code = reverseSkinMap[profileData.skinType];
      if (code) { newParams.append('skinType', code); updated = true; }
    }
    if (profileData.concerns && profileData.concerns.length > 0) {
      profileData.concerns.forEach(c => {
        const code = reverseConcernMap[c.trim()];
        if (code) { newParams.append('skinConcern', code); updated = true; }
      });
    }
    if (profileData.personalColor) {
      const code = reverseColorMap[profileData.personalColor.trim()];
      if (code) { newParams.append('personalColor', code); updated = true; }
    }

    if (updated) {
      newParams.set('page', '1');
      setSearchParams(newParams);
      setIsProfileMode(true);
    } else {
      alert("프로필에 설정된 정보가 없거나 매칭되는 필터가 없습니다.");
    }
  };

  const clearProfileFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('skinType');
    newParams.delete('skinConcern');
    newParams.delete('personalColor');
    setSearchParams(newParams);
    setIsProfileMode(false);
  };

  const handleProfileToggle = () => {
    if (isProfileMode) {
      clearProfileFilters();
    } else {
      if (userProfile) {
        applyProfileFilters(userProfile);
      } else {
        alert("피부 프로필 정보를 불러올 수 없습니다. 마이페이지에서 설정해주세요.");
      }
    }
  };

  // --- 상품 목록 조회 ---
  useEffect(() => {
    if (searchParams.get('q')) setIsProfileMode(false);

    const controller = new AbortController();
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const queryString = searchParams.toString();
        const response = await axios.get(`http://localhost:8080/api/products?${queryString}`, {
          signal: controller.signal
        });

        // 받아온 데이터에서 판매중지 상품은 화면에서 제외
        const validContent = (response.data.content || []).filter(p => p.status !== '판매중지');

        setProducts(validContent);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request canceled');
        } else {
          console.error(error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [searchParams]);

  useEffect(() => {
    if (isFilterOpen) {
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    }
  }, [isFilterOpen]);

  const updateSearchParams = (newParams, resetPage = true) => {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(newParams)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    if (resetPage) params.set('page', '1');
    setSearchParams(params);
    setIsProfileMode(false);
  };

  /**
   * 개별 필터 변경 시 호출되는 핸들러
   * - 필터가 변경되면 페이지를 1페이지로 초기화하고 URL 파라미터를 업데이트함.
   * - 사용자가 직접 필터를 조작하면 내 피부 맞춤 모드는 자동으로 해제됨.
   */
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
    setIsProfileMode(false);
  };

  const handleSearchChange = (e) => updateSearchParams({ q: e.target.value });
  const handleSortChange = (e) => updateSearchParams({ sort: e.target.value });
  const handlePageChange = (pageNumber) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    setSearchParams(params);
  };

  // --- 장바구니 담기 ---
  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn()) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    const member = getStoredMember();
    if (!member || !member.memNo) {
      alert('회원 정보를 찾을 수 없습니다.');
      return;
    }

    if (!product.defaultOptionNo) {
      alert('옵션을 선택해야 하는 상품입니다. 상세 페이지에서 담아주세요.');
      navigate(`/products/${product.prdNo}`);
      return;
    }

    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      // axios.post 사용
      await axios.post(
        'http://localhost:8080/api/coco/members/cart/items',
        {
          memNo: member.memNo,
          optionNo: product.defaultOptionNo,
          cartQty: 1
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (window.confirm(`${product.prdName}을(를) 장바구니에 담았습니다.\n장바구니로 이동하시겠습니까?`)) {
        navigate('/cart');
      }
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || '장바구니 담기에 실패했습니다.';
      alert(message);
    }
  };

  return (
    <div className="page-container">
      {/* 사이드바 (필터 옵션) */}
      <ProductSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        closeButtonRef={closeButtonRef}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        isLoggedIn={isLoggedIn()}
        isProfileMode={isProfileMode}
        onProfileToggle={handleProfileToggle}
      />

      <main className="main-content">
        {/* 상단 헤더 (총 개수, 정렬, 필터 버튼) */}
        <ProductListHeader
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          totalElements={totalElements}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onFilterToggle={() => setIsFilterOpen(true)}
        />

        {/* 상품 그리드 및 페이지네이션 */}
        {isLoading ? (
          <ProductListSkeleton />
        ) : products.length === 0 ? (
          <div className="no-results">
            <h3>검색 결과가 없습니다</h3>
            <p>필터 조건을 다시 확인해 주세요.</p>
          </div>
        ) : (
          <>
            <div className="product-list-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.prdNo}
                  product={product}
                  onAddToCart={(e) => handleAddToCart(e, product)}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default ProductListPage;