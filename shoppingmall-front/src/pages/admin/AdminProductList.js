import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Pagination from '../../components/admin/Pagination';
import Spinner from '../../components/admin/Spinner';
import '../../css/admin/AdminProductList.css';
import editIcon from '../../images/edit.svg';
import deleteIcon from '../../images/delete.svg';

/**
 * [AdminProductList] 관리자용 상품 관리 페이지
 * 역할:
 * 1. 전체 상품 목록 조회 (페이징, 검색, 카테고리/상태 필터)
 * 2. 상품 대시보드 통계 표시 (전체, 판매중, 품절, 재고 현황)
 * 3. 상품 삭제(논리적 삭제) 및 수정 페이지 이동 기능 제공
 */

const LIMIT = 6;

function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 검색 필터 상태
  const [searchTerm, setSearchTerm] = useState(''); // 입력창 표시용
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // 실제 검색 요청용 (API)
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('idAsc'); // 기본 정렬: ID 오름차순

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // 대시보드 상태
  const [dashboardCounts, setDashboardCounts] = useState({
    totalProducts: 0,
    inStock: 0,
    outOfStock: 0,
    totalStock: 0
  });

  // 카테고리 로드
  useEffect(() => {
    axios.get('http://localhost:8080/api/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error("카테고리 로드 실패:", err));
  }, []);

  // 대시보드 통계 및 상품 목록 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // 쿼리 파라미터 생성
        const params = {
          page: currentPage,
          size: LIMIT,
          sort: sortOrder,
          q: debouncedSearchTerm || undefined, // 디바운스된 값 사용
          categoryNo: selectedCategory || undefined,
          status: selectedStatus || undefined
        };

        // 상품 목록 요청
        const productRes = await axios.get('http://localhost:8080/api/products', { params });
        setProducts(productRes.data.content);
        setTotalPages(productRes.data.totalPages);

        // 통계 요청
        const statsRes = await axios.get('http://localhost:8080/api/admin/stats');
        setDashboardCounts({
          totalProducts: statsRes.data.totalProducts,
          inStock: statsRes.data.inStockProducts,
          outOfStock: statsRes.data.outOfStockProducts,
          totalStock: statsRes.data.totalStock
        });

      } catch (error) {
        console.error("데이터 로드 실패:", error);
        toast.error("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage, debouncedSearchTerm, selectedCategory, selectedStatus, sortOrder]);

  /**
   * 상품 삭제 핸들러
   * - 관리자가 삭제 확인 시 서버에 삭제 요청(Soft Delete)을 보냄
   * - 성공 시 UI 목록에서 즉시 제거하여 빠른 반응성 제공
   */
  const handleDelete = async (product) => {
    if (window.confirm(`정말 삭제하시겠습니까?\n상품명: ${product.prdName}`)) {
      try {
        await axios.delete(`http://localhost:8080/api/admin/products/${product.prdNo}`);
        toast.success('삭제되었습니다.');

        // 새로고침 로직
        if (products.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          // 빠른 UI 반영을 위해 클라이언트 상태 업데이트
          setProducts(prev => prev.filter(p => p.prdNo !== product.prdNo));
          setDashboardCounts(prev => ({ ...prev, totalProducts: prev.totalProducts - 1 }));
        }
      } catch (error) {
        toast.error("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleFilterChange = (setter) => (e) => {
    const value = e.target.value;

    if (setter === setSearchTerm) {
      // 입력값은 즉시 UI 반영
      setSearchTerm(value);

      // 기존 타이머 취소
      if (debounceTimer) clearTimeout(debounceTimer);

      const newTimer = setTimeout(() => {
        setDebouncedSearchTerm(value);
        setCurrentPage(1); // 검색 시 1페이지로 이동
      }, 500);
      setDebounceTimer(newTimer);
    } else {
      // 카테고리나 상태 변경은 즉시 적용
      setter(value);
      setCurrentPage(1);
    }
  };

  return (
    <div className="admin-page-container">
      {/* 페이지 타이틀과 밑줄 */}
      <h2 className="page-title">상품 관리</h2>

      {/* 대시보드 영역 */}
      <div className="dashboard-container">
        <div className="dash-card">
          <p className="dash-title">전체 상품</p>
          <p className="dash-value">{dashboardCounts.totalProducts}</p>
        </div>
        <div className="dash-card">
          <p className="dash-title">판매중</p>
          <p className="dash-value">{dashboardCounts.inStock}</p>
        </div>
        <div className="dash-card">
          <p className="dash-title">품절</p>
          <p className="dash-value">{dashboardCounts.outOfStock}</p>
        </div>
        <div className="dash-card">
          <p className="dash-title">총 재고</p>
          <p className="dash-value">{dashboardCounts.totalStock.toLocaleString()}</p>
        </div>
      </div>

      <div className="admin-content-card">
        <div className="content-header">
          <h3>상품 목록</h3>
          <div className="header-actions">
            <button className="btn-refresh" onClick={() => window.location.reload()}>🔄 새로고침</button>
            <Link to="/admin/product/new" className="btn-add-product">+ 상품 등록</Link>
          </div>
        </div>

        {/* 필터 영역 */}
        <div className="filter-container">
          <input
            type="text"
            className="search-input"
            placeholder="상품명 검색..."
            value={searchTerm}
            onChange={handleFilterChange(setSearchTerm)}
          />

          <select className="filter-select" value={selectedCategory} onChange={handleFilterChange(setSelectedCategory)}>
            <option value="">전체 카테고리</option>
            {categories.filter(c => !c.parentCategoryNo).map(cat => (
              <React.Fragment key={cat.categoryNo}>
                <option value={cat.categoryNo}>{cat.categoryName}</option>
                {categories.filter(sub => sub.parentCategoryNo === cat.categoryNo).map(sub => (
                  <option key={sub.categoryNo} value={sub.categoryNo}>&nbsp;&nbsp;└ {sub.categoryName}</option>
                ))}
              </React.Fragment>
            ))}
          </select>

          <select className="filter-select" value={selectedStatus} onChange={handleFilterChange(setSelectedStatus)}>
            <option value="ALL">전체 상태</option>
            <option value="SALE">판매중</option>
            <option value="SOLD_OUT">품절</option>
            <option value="STOP">판매중지</option>
          </select>

          <select className="filter-select" value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}>
            <option value="idAsc">등록순 (ID)</option>
            <option value="newest">최신순</option>
            <option value="popularity">인기순</option>
            <option value="priceAsc">낮은 가격순</option>
            <option value="priceDesc">높은 가격순</option>
          </select>
        </div>

        {/* 테이블 영역 */}
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th style={{ width: '80px' }}>이미지</th>
                <th>상품명</th>
                <th style={{ width: '120px' }}>카테고리</th>
                <th style={{ width: '100px' }}>가격</th>
                <th style={{ width: '80px' }}>재고</th>
                <th style={{ width: '80px' }}>상태</th>
                <th style={{ width: '120px' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="8" className="loading-cell"><Spinner /></td></tr>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.prdNo}>
                    <td>{product.prdNo}</td>
                    <td>
                      <img
                        src={product.imageUrl || '/placeholder.png'}
                        alt="상품"
                        className="product-thumb"
                        onError={(e) => e.target.src = '/placeholder.png'}
                      />
                    </td>
                    <td className="fw-bold">{product.prdName}</td>
                    <td>{product.categoryName}</td>
                    <td>{product.prdPrice.toLocaleString()}원</td>
                    <td>{product.stock}개</td>
                    <td>
                      {/* 상태값 CSS 클래스로 색상 처리 */}
                      <span className={`status-tag ${product.status === '판매중' ? 'status-sale' :
                          product.status === '품절' ? 'status-soldout' : 'status-stop'
                        }`}>
                        {product.status}
                      </span>
                    </td>
                    {/* 수정, 삭제 버튼 영역 */}
                    <td>
                      <Link to={`/admin/product/edit/${product.prdNo}`} className="icon-btn edit" title="수정">
                        <img src={editIcon} alt="수정" />
                      </Link>
                      <button onClick={() => handleDelete(product)} className="icon-btn delete" title="삭제">
                        <img src={deleteIcon} alt="삭제" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" className="empty-cell">검색 결과가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}

export default AdminProductList;