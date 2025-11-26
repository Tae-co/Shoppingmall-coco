import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductDetailSkeleton from '../../components/product/detail/ProductDetailSkeleton';
import ProductImageGallery from '../../components/product/detail/ProductImageGallery';
import ProductInfoBox from '../../components/product/detail/ProductInfoBox';
import ProductTabs from '../../components/product/detail/ProductTabs';
import { getStoredMember, isLoggedIn, STORAGE_KEYS } from '../../utils/api';
import '../../css/product/ProductDetailPage.css';

function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState('');
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');

  // --- 상품 상세 조회 ---
  useEffect(() => {
    const fetchProductDetail = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/api/products/${productId}`);
        setProduct(response.data);
      } catch (error) {
        console.error(error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductDetail();
  }, [productId]);

  // --- 토스트 메시지 로직 ---
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleBack = () => {
    navigate(-1);
  };

  // --- 장바구니 담기 ---
  const handleAddToCart = async () => {
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

    let optionNoToUse;
    const hasOptions = product.options && product.options.length > 0;

    if (selectedOption) {
      optionNoToUse = Number(selectedOption);
    } else if (hasOptions) {
      alert('옵션을 선택하세요.');
      return;
    } else {
      alert('상품 옵션 정보가 없습니다. 관리자에게 문의하세요.');
      return;
    }

    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      await axios.post(
        'http://localhost:8080/api/coco/members/cart/items',
        {
          memNo: member.memNo,
          optionNo: optionNoToUse,
          cartQty: quantity
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setToastMessage('장바구니에 상품을 담았습니다.');
      if (window.confirm('장바구니로 이동하시겠습니까?')) { navigate('/cart'); }

    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || '장바구니 담기에 실패했습니다.';
      alert(message);
    }
  };

  const handleBuyNow = () => {
    if (!selectedOption && product.options && product.options.length > 0) {
      alert('옵션을 선택하세요.');
      return;
    }
    alert("바로구매 기능은 현재 준비 중입니다.\n장바구니를 이용해 주세요.");
    console.log(`[주문 담당] ${product.prdName}, 옵션: ${selectedOption}, 수량: ${quantity} 바로구매`);
  };

  if (isLoading) {
    return (
      <div className="detail-container">
        <div className="back-btn-container">
          <button className="back-btn" onClick={handleBack}>&lt; 뒤로가기</button>
        </div>
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="detail-container">
        <div className="back-btn-container">
          <button className="back-btn" onClick={handleBack}>&lt; 뒤로가기</button>
        </div>
        <div className="error-message-box">
          <h3>상품을 찾을 수 없습니다</h3>
          <p>URL을 다시 확인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-container">
      {/* 토스트 알림 */}
      <div className={`toast ${toastMessage ? 'show' : 'hide'}`}>
        {toastMessage}
      </div>

      <div className="back-btn-container">
        <button className="back-btn" onClick={handleBack}>&lt; 뒤로가기</button>
      </div>

      <div className="top-section">
        <ProductImageGallery
          productName={product.prdName}
          imageUrls={product.imageUrls}
        />

        <ProductInfoBox
          product={product}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          quantity={quantity}
          setQuantity={setQuantity}
          handleAddToCart={handleAddToCart}
          handleBuyNow={handleBuyNow}
        />
      </div>
      <ProductTabs product={product} />
    </div>
  );
}

export default ProductDetailPage;