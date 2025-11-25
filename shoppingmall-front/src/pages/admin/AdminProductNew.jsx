import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProductForm from '../../components/admin/ProductForm';

function AdminProductNew() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // 카테고리 목록 불러오기
    fetch('http://localhost:8080/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => toast.error('카테고리 로드 실패'));
  }, []);

  const handleCreate = async (formData, options, imageFile) => {
    // 유효성 검사
    if (!formData.prdName) return toast.warn('상품명을 입력하세요.');
    if (!formData.categoryNo) return toast.warn('카테고리를 선택하세요.');
    if (!imageFile) return toast.warn('이미지를 등록하세요.');

    // DTO 구성
    const productDto = {
      ...formData,
      categoryNo: Number(formData.categoryNo),
      prdPrice: Number(formData.prdPrice),
      stock: 0, 
      skinType: formData.skinType.join(','),
      skinConcern: formData.skinConcern.join(','),
      personalColor: formData.personalColor.join(','),
      options: options.map(opt => ({
        ...opt,
        addPrice: Number(opt.addPrice),
        stock: Number(opt.stock)
      }))
    };

    const dataToSend = new FormData();
    dataToSend.append("dto", new Blob([JSON.stringify(productDto)], { type: "application/json" }));
    
    if (imageFile) {
      dataToSend.append("imageFiles", imageFile);
    }

    try {
      const response = await fetch('http://localhost:8080/api/admin/products', {
        method: 'POST',
        body: dataToSend,
      });

      if (!response.ok) throw new Error('등록 실패');
      
      toast.success('상품이 등록되었습니다.');
      navigate('/admin/products');
    } catch (error) {
      console.error(error);
      toast.error('상품 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <ProductForm 
      categories={categories} 
      onSubmit={handleCreate} 
      isEdit={false}
    />
  );
}

export default AdminProductNew;