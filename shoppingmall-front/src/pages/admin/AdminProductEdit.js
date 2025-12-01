import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios'; // Axios Import
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
        // Axios.all을 사용해 병렬 요청
        const [catRes, prdRes] = await Promise.all([
          axios.get('http://localhost:8080/api/categories'),
          axios.get(`http://localhost:8080/api/products/${productId}`)
        ]);

        setCategories(catRes.data);
        setProductData(prdRes.data);
      } catch (error) {
        console.error(error);
        toast.error('데이터를 불러오지 못했습니다.');
        navigate('/admin/products');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [productId, navigate]);

  const handleUpdate = async (formData, options, imageFiles) => {
    const productDto = {
      ...formData,
      categoryNo: Number(formData.categoryNo),
      prdPrice: Number(formData.prdPrice),
      // 배열을 문자열로 변환 (DB 저장용)
      skinType: Array.isArray(formData.skinType) ? formData.skinType.join(',') : formData.skinType,
      skinConcern: Array.isArray(formData.skinConcern) ? formData.skinConcern.join(',') : formData.skinConcern,
      personalColor: Array.isArray(formData.personalColor) ? formData.personalColor.join(',') : formData.personalColor,
      options: options.map(opt => ({
        optionNo: opt.optionNo || null,
        optionName: opt.optionName,
        optionValue: opt.optionValue,
        addPrice: Number(opt.addPrice),
        stock: Number(opt.stock)
      }))
    };

    const dataToSend = new FormData();
    dataToSend.append("dto", new Blob([JSON.stringify(productDto)], { type: "application/json" }));

    // 새 이미지가 있는 경우에만 추가
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach(file => {
        dataToSend.append("imageFiles", file);
      });
    }

    try {
      // 토큰 가져오기
      const token = localStorage.getItem('token');
      // Axios PUT
      await axios.put(`http://localhost:8080/api/admin/products/${productId}`, dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success('상품이 수정되었습니다.');
      navigate('/admin/products');
    } catch (error) {
      console.error(error);
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