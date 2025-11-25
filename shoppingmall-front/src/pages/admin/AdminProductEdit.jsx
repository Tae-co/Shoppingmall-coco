import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from '../../components/admin/Spinner';
import ProductForm from '../../components/admin/ProductForm';

function AdminProductEdit() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [productData, setProductData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, prdRes] = await Promise.all([
          fetch('http://localhost:8080/api/categories'),
          fetch(`http://localhost:8080/api/products/${productId}`)
        ]);

        if (!catRes.ok || !prdRes.ok) throw new Error('데이터 로드 실패');

        const categoriesData = await catRes.json();
        const product = await prdRes.json();

        setCategories(categoriesData);
        setProductData(product); // Form에 전달할 초기 데이터
      } catch (error) {
        toast.error('데이터를 불러오지 못했습니다.');
        navigate('/admin/products');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [productId, navigate]);

  const handleUpdate = async (formData, options, imageFile) => {
    const productDto = {
      ...formData,
      categoryNo: Number(formData.categoryNo),
      prdPrice: Number(formData.prdPrice),
      skinType: Array.isArray(formData.skinType) ? formData.skinType.join(',') : formData.skinType,
      skinConcern: Array.isArray(formData.skinConcern) ? formData.skinConcern.join(',') : formData.skinConcern,
      personalColor: Array.isArray(formData.personalColor) ? formData.personalColor.join(',') : formData.personalColor,
      options: options.map(opt => ({
        optionNo: opt.optionNo || null, // 기존 옵션 ID 유지
        optionName: opt.optionName,
        optionValue: opt.optionValue,
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
      const response = await fetch(`http://localhost:8080/api/admin/products/${productId}`, {
        method: 'PUT',
        body: dataToSend,
      });

      if (!response.ok) throw new Error('수정 실패');

      toast.success('상품이 수정되었습니다.');
      navigate('/admin/products');
    } catch (error) {
      toast.error('수정 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <ProductForm 
      initialData={productData}
      categories={categories}
      onSubmit={handleUpdate}
      isEdit={true}
    />
  );
}

export default AdminProductEdit;