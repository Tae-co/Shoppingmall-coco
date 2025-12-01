import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../../components/admin/Spinner';
import CategoryTable from '../../components/admin/CategoryTable';
import '../../css/admin/AdminCategoryList.css'; // CSS 파일 임포트

/**
 * [AdminCategoryList] 관리자 카테고리 관리 페이지
 * 역할:
 * 1. 카테고리 목록 조회 (대분류/소분류 계층 구조 시각화)
 * 2. 신규 카테고리 생성 (상위 카테고리 선택 기능 포함)
 * 3. 카테고리 수정 및 삭제 기능
 */

function AdminCategoryList() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 입력 폼 상태 (신규 추가 및 수정 공용)
  const [newCategoryName, setNewCategoryName] = useState('');
  const [parentCategoryNo, setParentCategoryNo] = useState('');
  const [editId, setEditId] = useState(null); // 수정 중인 카테고리 ID (null이면 추가 모드)

  // 목록 조회
  const loadCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error(error);
      toast.error('카테고리 로드 실패');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // 카테고리 목록이 로드되거나 변경될 때, 기본값으로 첫 번째 대분류 자동 선택
  useEffect(() => {
    if (categories.length > 0 && !editId) {
      // 대분류만 찾기
      const parents = categories.filter(c => !c.parentCategory && !c.parentCategoryNo);
      if (parents.length > 0) {
        setParentCategoryNo(parents[0].categoryNo);
      }
    }
  }, [categories, editId]);

  // 폼 초기화
  const resetForm = () => {
    setNewCategoryName('');
    setEditId(null);
    // 초기화 시에도 첫 번째 대분류로 설정
    const parents = categories.filter(c => !c.parentCategory && !c.parentCategoryNo);
    if (parents.length > 0) {
      setParentCategoryNo(parents[0].categoryNo);
    }
  };

  /**
   * 카테고리 폼 제출 핸들러 (추가/수정 분기 처리)
   * - editId 존재 여부에 따라 POST(생성) 또는 PUT(수정) 요청을 보냄
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!newCategoryName.trim()) {
      toast.warn('카테고리 이름을 입력하세요.');
      return;
    }

    // 부모 카테고리 필수 체크
    if (!editId && !parentCategoryNo) {
      toast.warn('상위 카테고리를 선택해야 합니다.');
      return;
    }

    // 대분류/소분류 로직: 부모 ID가 없으면 대분류, 있으면 소분류로 처리
    const categoryData = {
      categoryName: newCategoryName,
      parentCategoryNo: parentCategoryNo || null
    };

    try {
      // 토큰 가져오기
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (editId) {
        // 수정 (PUT)
        await axios.put(`http://localhost:8080/api/admin/categories/${editId}`, categoryData, config);
        toast.success('수정되었습니다.');
      } else {
        // 추가 (POST)
        await axios.post('http://localhost:8080/api/admin/categories', categoryData, config);
        toast.success('추가되었습니다.');
      }

      resetForm(); // 폼 초기화
      loadCategories(); // 목록 갱신 (최신 데이터 반영)
    } catch (error) {
      console.error(error);
      toast.error('작업에 실패했습니다.');
    }
  };

  // 수정 버튼 클릭
  const handleEditClick = (category) => {
    setEditId(category.categoryNo);
    setNewCategoryName(category.categoryName);

    // 부모가 있으면 부모 ID, 없으면 빈 값
    if (category.parentCategoryNo) {
      setParentCategoryNo(category.parentCategoryNo);
    } else if (category.parentCategory) {
      setParentCategoryNo(category.parentCategory.categoryNo);
    } else {
      setParentCategoryNo('');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 삭제 버튼 클릭
  const handleDeleteCategory = async (category) => {
    if (window.confirm(`'${category.categoryName}' 카테고리를 삭제하시겠습니까?`)) {
      try {
        // 토큰 가져오기
        const token = localStorage.getItem('token');

        await axios.delete(`http://localhost:8080/api/admin/categories/${category.categoryNo}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        toast.success('삭제되었습니다.');
        loadCategories();
      } catch (error) {
        console.error(error);
        toast.error('삭제 실패 (하위 상품이 있거나 오류 발생)');
      }
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="admin-page-container">
      <h2 className="page-title">카테고리 관리</h2>

      {/* 카테고리 입력/수정 폼 카드 */}
      <div className="admin-card form-card">
        <h3 className="content-title">
          {editId ? '카테고리 수정' : '하위 카테고리 추가'}
        </h3>

        <form className="category-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>상위 카테고리</label>
            <select
              className="admin-input"
              value={parentCategoryNo}
              onChange={(e) => setParentCategoryNo(e.target.value)}
            >
              {/* 대분류만 필터링해서 보여줌 */}
              {categories
                .filter(cat => !cat.parentCategory && !cat.parentCategoryNo)
                .map((cat) => (
                  <option key={cat.categoryNo} value={cat.categoryNo}>
                    {cat.categoryName}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>카테고리 이름</label>
            <input
              className="admin-input"
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="예: 수분크림, 립스틱 등"
            />
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-primary">
              {editId ? '수정 완료' : '추가'}
            </button>
            {editId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                취소
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 카테고리 목록 테이블 카드 */}
      <div className="admin-card">
        <div className="card-header">
          <h3 className="content-title">카테고리 목록</h3>
        </div>
        {/* 계층형 테이블 컴포넌트 */}
        <CategoryTable
          categories={categories}
          onEdit={handleEditClick}
          onDelete={handleDeleteCategory}
        />
      </div>
    </div>
  );
}

export default AdminCategoryList;