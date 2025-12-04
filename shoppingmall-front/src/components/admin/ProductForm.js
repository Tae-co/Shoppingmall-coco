import React, { useState, useEffect } from 'react';
import TagCheckboxGroup from './TagCheckboxGroup';
import '../../css/admin/ProductForm.css';

/**
 * [관리자] 상품 등록 및 수정 양식 컴포넌트
 */

const organizeCategories = (categories) => {
  const parents = categories.filter(c => !c.parentCategory && !c.parentCategoryNo);
  const result = [];

  parents.forEach(parent => {
    result.push({ ...parent, displayName: parent.categoryName, isParent: true });
    const children = categories.filter(c => {
      const pId = c.parentCategory ? c.parentCategory.categoryNo : c.parentCategoryNo;
      return pId === parent.categoryNo;
    });
    children.forEach(child => {
      result.push({ ...child, displayName: `└ ${child.categoryName}`, isParent: false });
    });
  });
  return result;
};

const TAG_OPTIONS = {
  skinTypes: [
    { id: 'dry', label: '건성' }, { id: 'oily', label: '지성' },
    { id: 'combination', label: '복합성' }, { id: 'sensitive', label: '민감성' }
  ],
  skinConcerns: [
    { id: 'hydration', label: '수분' }, { id: 'moisture', label: '보습' },
    { id: 'brightening', label: '미백' }, { id: 'tone', label: '피부톤' },
    { id: 'soothing', label: '진정' }, { id: 'sensitive', label: '민감' },
    { id: 'uv', label: '자외선차단' }, { id: 'wrinkle', label: '주름' },
    { id: 'elasticity', label: '탄력' }, { id: 'pores', label: '모공' }
  ],
  personalColors: [
    { id: 'spring', label: '봄 웜톤' },
    { id: 'summer', label: '여름 쿨톤' },
    { id: 'autumn', label: '가을 웜톤' },
    { id: 'winter', label: '겨울 쿨톤' }
  ]
};

function ProductForm({ initialData, categories, onSubmit, isEdit }) {
  // 폼 입력 데이터 상태 관리
  const [formData, setFormData] = useState({
    prdName: '', description: '', categoryNo: '', prdPrice: 0,
    status: 'SALE', howToUse: '', skinType: [], skinConcern: [], personalColor: [],
    ...initialData
  });

  // 동적 옵션 리스트 상태 (기본값: 1개)
  const [options, setOptions] = useState(initialData?.options || [
    { optionName: '기본', optionValue: '', addPrice: 0, stock: 0 }
  ]);

  /**
   * 이미지 통합 관리 State
   * - type: OLD(기존 URL) 또는 NEW(새로 업로드된 File 객체)
   * - url: 화면 표시용 미리보기 URL
   */
  const [imageList, setImageList] = useState([]);

  // 초기 데이터 로드 시 State 동기화
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        skinType: initialData.skinTypes || [],
        skinConcern: initialData.skinConcerns || [],
        personalColor: initialData.personalColors || []
      }));
      if (initialData.options && initialData.options.length > 0) {
        setOptions(initialData.options);
      }
      // 기존 이미지 URL을 리스트 형태로 변환하여 세팅
      if (initialData.imageUrls && initialData.imageUrls.length > 0) {
        const oldImages = initialData.imageUrls.map(url => ({
          type: 'OLD',
          url: url,
          file: null
        }));
        setImageList(oldImages);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        type: 'NEW',
        url: URL.createObjectURL(file), // 미리보기용 Blob URL
        file: file
      }));
      // 기존 리스트 뒤에 추가
      setImageList(prev => [...prev, ...newFiles]);
    }
    e.target.value = ''; // 같은 파일 재선택 허용
  };

  // 이미지 삭제 핸들러
  const removeImage = (index) => {
    setImageList(prev => prev.filter((_, i) => i !== index));
  };

  // 대표 이미지 설정 (맨 앞으로 이동)
  const setAsMainImage = (index) => {
    if (index === 0) return;
    setImageList(prev => {
      const list = [...prev];
      const item = list.splice(index, 1)[0];
      list.unshift(item); // 맨 앞에 추가
      return list;
    });
  };

  const handleCheckboxChange = (groupName, value) => {
    setFormData(prev => {
      const current = prev[groupName] || [];
      const next = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [groupName]: next };
    });
  };
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { optionName: '', optionValue: '', addPrice: 0, stock: 0 }]);
  };

  const removeOption = (index) => {
    if (options.length === 1) return alert("최소 1개의 옵션이 필요합니다.");
    setOptions(options.filter((_, i) => i !== index));
  };

  /**
   * 폼 제출 핸들러
   * - 이미지 리스트를 분석하여 유지할 URL 리스트와 새로 추가할 파일 리스트로 분리
   * - 부모 컴포넌트(onSubmit)로 정제된 데이터 전달
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // 기존 이미지 중 유지된 것과 새 이미지가 들어갈 자리를 마킹("NEW_FILE")하여 순서 리스트 생성
    const imageOrderList = imageList.map(img =>
      img.type === 'OLD' ? img.url : "NEW_FILE"
    );

    // 실제 업로드할 새 파일 객체만 추출
    const newFiles = imageList
      .filter(img => img.type === 'NEW')
      .map(img => img.file);

    const finalData = { ...formData, keptImageUrls: imageOrderList };

    onSubmit(finalData, options, newFiles);
  };

  const sortedCategories = organizeCategories(categories || []); // categories가 undefined일 경우 방지

  return (
    <>
      <div className="form-header">
        <h2 className="form-page-title">{isEdit ? `상품 수정 (ID: ${initialData.prdNo})` : '새 상품 등록'}</h2>
        <button className="btn-submit" onClick={handleSubmit}>
          {isEdit ? '수정 완료' : '상품 등록'}
        </button>
      </div>

      <form className="product-form-container" onSubmit={handleSubmit}>
        {/* 왼쪽 영역 */}
        <div>
          <div className="form-section">
            <h3 className="section-title">기본 정보</h3>
            <div className="form-group">
              <label className="form-label">상품명 *</label>
              <input className="form-input" name="prdName" value={formData.prdName} onChange={handleChange} required placeholder="상품명을 입력하세요" />
            </div>
            <div className="form-group">
              <label className="form-label">상품 설명</label>
              <textarea className="form-textarea" name="description" value={formData.description} onChange={handleChange} placeholder="상세 설명을 입력하세요" />
            </div>
            <div className="form-group">
              <label className="form-label">사용 방법</label>
              <textarea className="form-textarea" style={{ minHeight: '100px' }} name="howToUse" value={formData.howToUse} onChange={handleChange} placeholder="사용 방법을 입력하세요" />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">옵션 및 재고 관리</h3>
            <div className="option-header">
              <span style={{ width: '20%' }}>옵션명</span>
              <span style={{ flex: 1 }}>옵션값</span>
              <span style={{ width: '15%' }}>추가금</span>
              <span style={{ width: '15%' }}>재고</span>
              <span style={{ width: '50px' }}>삭제</span>
            </div>
            {options.map((opt, idx) => (
              <div className="option-row" key={idx}>
                <input className="form-input" style={{ width: '20%' }} placeholder="예: 용량" value={opt.optionName} onChange={e => handleOptionChange(idx, 'optionName', e.target.value)} />
                <input className="form-input" style={{ flex: 1 }} placeholder="예: 50ml" value={opt.optionValue} onChange={e => handleOptionChange(idx, 'optionValue', e.target.value)} />
                <input className="form-input" type="number" style={{ width: '15%' }} placeholder="0" value={opt.addPrice} onChange={e => handleOptionChange(idx, 'addPrice', e.target.value)} />
                <input className="form-input" type="number" style={{ width: '15%' }} placeholder="0" value={opt.stock} onChange={e => handleOptionChange(idx, 'stock', e.target.value)} />
                <button type="button" className="btn-remove-option" onClick={() => removeOption(idx)}>X</button>
              </div>
            ))}
            <button type="button" className="btn-add-option" onClick={addOption}>+ 옵션 추가하기</button>
          </div>

          <div className="form-section">
            <h3 className="section-title">상품 속성 (필터용)</h3>
            <TagCheckboxGroup label="피부 타입" groupName="skinType" options={TAG_OPTIONS.skinTypes} selectedValues={formData.skinType} onChange={handleCheckboxChange} />
            <TagCheckboxGroup label="피부 고민" groupName="skinConcern" options={TAG_OPTIONS.skinConcerns} selectedValues={formData.skinConcern} onChange={handleCheckboxChange} />
            <TagCheckboxGroup label="퍼스널 컬러" groupName="personalColor" options={TAG_OPTIONS.personalColors} selectedValues={formData.personalColor} onChange={handleCheckboxChange} />
          </div>
        </div>

        {/* 오른쪽 사이드바 */}
        <div>
          <div className="form-section">
            <h3 className="section-title">구성</h3>
            <div className="form-group">
              <label className="form-label">판매 상태</label>
              <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                <option value="SALE">판매중</option>
                <option value="SOLD_OUT">품절</option>
                <option value="STOP">판매중지</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">카테고리 *</label>
              <select className="form-select" name="categoryNo" value={formData.categoryNo} onChange={handleChange} required>
                <option value="" disabled>카테고리 선택</option>
                {sortedCategories.map(cat => (
                  <option
                    key={cat.categoryNo}
                    value={cat.categoryNo}
                    disabled={cat.isParent}
                    style={cat.isParent ? { fontWeight: 'bold', color: '#333' } : { color: '#555' }}
                  >
                    {cat.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">기본 가격 *</label>
              <input className="form-input" type="number" name="prdPrice" value={formData.prdPrice} onChange={handleChange} required />
            </div>
          </div>

          {/* 이미지 관리 섹션 */}
          <div className="form-section">
            <h3 className="section-title">상품 이미지</h3>

            {/* 이미지 리스트 영역 */}
            {imageList.length > 0 ? (
              <div className="image-upload-container">
                {imageList.map((img, idx) => (
                  <div
                    key={idx}
                    className={`image-preview-card ${idx === 0 ? 'is-main' : ''}`}
                    onClick={() => setAsMainImage(idx)}
                    title="클릭하여 대표 이미지로 설정"
                  >
                    <img
                      src={img.url}
                      alt={`img-${idx}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/prd_placeholder.png';
                      }} />
                    {idx === 0 && <div className="main-badge">대표</div>}
                    {img.type === 'NEW' && <div className="new-badge">NEW</div>} {/* 새 이미지 표시 */}
                    <button
                      type="button"
                      className="btn-remove-image"
                      onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                    >✕</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-image">등록된 이미지가 없습니다</div>
            )}

            <input
              type="file"
              accept="image/*"
              multiple /* 다중 선택 허용 */
              onChange={handleFileChange}
              style={{ fontSize: '14px' }}
            />
            <p className="image-help-text">
              * 이미지를 클릭하면 <strong>대표 이미지</strong>로 설정됩니다.<br />
              * 기존 이미지 삭제 및 순서 변경이 가능합니다.<br />
              * 1:1 비율(1000px) 권장
            </p>
          </div>
        </div>
      </form>
    </>
  );
}

export default ProductForm;