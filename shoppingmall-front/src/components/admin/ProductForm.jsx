import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import TagCheckboxGroup from './TagCheckboxGroup';
import {
  FormGroup, Label, Input, Textarea, Select, Button, Card
} from '../../styles/admincommon';

// --- 스타일 정의 ---
const FormContainer = styled.form`
  display: grid;
  grid-template-columns: 2fr 1fr; /* 본문 2 : 사이드 1 비율 */
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* 모바일은 1단 */
  }
`;

const Section = styled(Card)`
  margin-bottom: 24px;
  padding: 24px;
  background: #fff;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-bottom: 10px;
  background-color: #f9f9f9;
`;

const OptionRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  align-items: center;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PageTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #111;
`;

// 카테고리를 계층형으로 정렬하는 헬퍼 함수
const organizeCategories = (categories) => {
  const parents = categories.filter(c => !c.parentCategoryNo && !c.parentCategory);
  const result = [];

  parents.forEach(parent => {
    // 대분류 추가
    result.push({ ...parent, displayName: parent.categoryName, isParent: true });
    
    // 해당 대분류의 소분류들 찾아서 추가
    const children = categories.filter(c => {
       const pId = c.parentCategory ? c.parentCategory.categoryNo : c.parentCategoryNo;
       return pId === parent.categoryNo;
    });

    children.forEach(child => {
      // 소분류는 앞에 '└ ' 등을 붙여서 들여쓰기 효과
      result.push({ ...child, displayName: `└ ${child.categoryName}`, isParent: false });
    });
  });

  return result;
};

// --- 태그 옵션 상수 ---
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
    { id: 'cool', label: '쿨톤' }, { id: 'warm', label: '웜톤' }, { id: 'neutral', label: '뉴트럴톤' }
  ]
};

function ProductForm({ initialData, categories, onSubmit, isEdit }) {
  // 폼 상태
  const [formData, setFormData] = useState({
    prdName: '',
    description: '',
    categoryNo: '',
    prdPrice: 0,
    status: 'SALE',
    howToUse: '',
    skinType: [],
    skinConcern: [],
    personalColor: [],
    ...initialData // 초기값 덮어쓰기
  });

  const [options, setOptions] = useState(initialData?.options || [
    { optionName: '기본', optionValue: '', addPrice: 0, stock: 0 }
  ]);

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || '');

  // 데이터 동기화 (수정 모드일 때 초기 데이터 로드)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
      if (initialData.options && initialData.options.length > 0) {
        setOptions(initialData.options);
      }
      if (initialData.imageUrls && initialData.imageUrls.length > 0) {
        setPreviewUrl(initialData.imageUrls[0]);
      }
    }
  }, [initialData]);

  // 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // 미리보기 업데이트
    }
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

  // 옵션 관리
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // 상위 컴포넌트로 데이터 전달
    onSubmit(formData, options, imageFile);
  };

  const sortedCategories = organizeCategories(categories);

  return (
    <>
      <HeaderRow>
        <PageTitle>{isEdit ? `상품 수정 (ID: ${initialData.prdNo})` : '새 상품 등록'}</PageTitle>
        <Button onClick={handleSubmit} $primary style={{ width: '150px' }}>
          {isEdit ? '수정 완료' : '상품 등록'}
        </Button>
      </HeaderRow>

      <FormContainer onSubmit={handleSubmit}>
        {/* === 왼쪽 메인 영역 === */}
        <div>
          {/* 기본 정보 섹션 */}
          <Section>
            <SectionTitle>기본 정보</SectionTitle>
            <FormGroup>
              <Label>상품명 *</Label>
              <Input name="prdName" value={formData.prdName} onChange={handleChange} required placeholder="상품명을 입력하세요" />
            </FormGroup>
            <FormGroup>
              <Label>상품 설명</Label>
              <Textarea name="description" value={formData.description} onChange={handleChange} style={{ minHeight: '150px' }} placeholder="상세 설명을 입력하세요" />
            </FormGroup>
            <FormGroup>
              <Label>사용 방법</Label>
              <Textarea name="howToUse" value={formData.howToUse} onChange={handleChange} placeholder="사용 방법을 입력하세요" />
            </FormGroup>
          </Section>

          {/* 옵션 및 재고 섹션 */}
          <Section>
            <SectionTitle>옵션 및 재고 관리</SectionTitle>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#666' }}>
              <span style={{ width: '20%' }}>옵션명</span>
              <span style={{ flex: 1 }}>옵션값</span>
              <span style={{ width: '15%' }}>추가금</span>
              <span style={{ width: '15%' }}>재고</span>
              <span style={{ width: '50px' }}>삭제</span>
            </div>
            {options.map((opt, idx) => (
              <OptionRow key={idx}>
                <Input style={{ width: '20%' }} placeholder="예: 용량" value={opt.optionName} onChange={e => handleOptionChange(idx, 'optionName', e.target.value)} />
                <Input style={{ flex: 1 }} placeholder="예: 50ml" value={opt.optionValue} onChange={e => handleOptionChange(idx, 'optionValue', e.target.value)} />
                <Input type="number" style={{ width: '15%' }} placeholder="0" value={opt.addPrice} onChange={e => handleOptionChange(idx, 'addPrice', e.target.value)} />
                <Input type="number" style={{ width: '15%' }} placeholder="0" value={opt.stock} onChange={e => handleOptionChange(idx, 'stock', e.target.value)} />
                <Button type="button" onClick={() => removeOption(idx)} style={{ background: '#ff6b6b', color: 'white', padding: '10px', width: '50px' }}>X</Button>
              </OptionRow>
            ))}
            <Button type="button" onClick={addOption} style={{ width: '100%', marginTop: '10px', border: '1px dashed #ccc', background: '#fff', color: '#555' }}>
              + 옵션 추가하기
            </Button>
          </Section>

          {/* 태그 섹션 (하단 배치) */}
          <Section>
            <SectionTitle>상품 속성 (필터용)</SectionTitle>
            <TagCheckboxGroup label="피부 타입" groupName="skinType" options={TAG_OPTIONS.skinTypes} selectedValues={formData.skinType} onChange={handleCheckboxChange} />
            <TagCheckboxGroup label="피부 고민" groupName="skinConcern" options={TAG_OPTIONS.skinConcerns} selectedValues={formData.skinConcern} onChange={handleCheckboxChange} />
            <TagCheckboxGroup label="퍼스널 컬러" groupName="personalColor" options={TAG_OPTIONS.personalColors} selectedValues={formData.personalColor} onChange={handleCheckboxChange} />
          </Section>
        </div>

        {/* === 오른쪽 사이드바 영역 === */}
        <div>
          {/* 상태 및 카테고리 */}
          <Section>
            <SectionTitle>구성</SectionTitle>
            <FormGroup>
              <Label>판매 상태</Label>
              <Select name="status" value={formData.status} onChange={handleChange}>
                <option value="SALE">판매중</option>
                <option value="SOLD_OUT">품절</option>
                <option value="STOP">판매중지</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>카테고리 *</Label>
              <Select name="categoryNo" value={formData.categoryNo} onChange={handleChange} required>
                <option value="" disabled>카테고리 선택</option>
                {sortedCategories.map(cat => (
                  <option
                    key={cat.categoryNo}
                    value={cat.categoryNo}
                    // 대분류(부모)는 상품 등록 못하게 막고 싶으면 disabled 추가
                    disabled={cat.isParent} 
                    style={cat.isParent ? { fontWeight: 'bold', color: '#333' } : { color: '#555' }}
                  >
                    {cat.displayName}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>기본 가격 *</Label>
              <Input type="number" name="prdPrice" value={formData.prdPrice} onChange={handleChange} required />
            </FormGroup>
          </Section>

          {/* 이미지 업로드 */}
          <Section>
            <SectionTitle>대표 이미지</SectionTitle>
            {previewUrl ? (
              <ImagePreview src={previewUrl} alt="Preview" />
            ) : (
              <div style={{ height: '250px', background: '#f9f9f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', marginBottom: '10px', border: '1px solid #ddd' }}>이미지 없음</div>
            )}
            <Input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '14px' }} />
            <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
              * 권장 사이즈: 1000x1000px (1:1 비율)<br />
              * 최대 5MB, JPG/PNG
            </p>
          </Section>
        </div>
      </FormContainer>
    </>
  );
}

export default ProductForm;