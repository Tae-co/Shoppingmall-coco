/**
 * [ProductDetailPage] 상품 상세 페이지 컴포넌트
 * 역할:
 * 1. 상품의 상세 정보(이미지, 가격, 설명 등) 조회 및 표시
 * 2. 옵션 선택 및 수량 조절 기능 제공
 * 3. 장바구니 담기 및 바로 구매 프로세스 처리
 * 4. 하위 컴포넌트(갤러리, 정보박스, 탭 등) 조합 및 데이터 전달
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductDetailSkeleton from '../../components/product/detail/ProductDetailSkeleton';
import ProductImageGallery from '../../components/product/detail/ProductImageGallery';
import ProductInfoBox from '../../components/product/detail/ProductInfoBox';
import ProductTabs from '../../components/product/detail/ProductTabs';
import { getStoredMember, isLoggedIn, STORAGE_KEYS } from '../../utils/api';
import { useOrder } from '../OrderContext';
import '../../css/product/ProductDetailPage.css';

function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState('');
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  const { setOrderSubtotal } = useOrder(); // 전역 주문 금액 설정 함수

  // 상품 상세 데이터 조회 (페이지 진입 시 1회 실행)
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

  /**
   * 장바구니 담기 핸들러
   * - 로그인 여부 체크
   * - 필수 옵션 선택 여부 검증
   * - 서버 장바구니 API 호출 및 결과 알림(토스트/confirm) 처리
   */
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

  /**
   * 바로 구매 핸들러
   * - 옵션 선택 여부 및 로그인 상태 확인
   * - 선택한 상품 정보를 가지고 주문 페이지(/order)로 즉시 이동
   * - 단일 상품 주문이므로 장바구니를 거치지 않음
   */
  const handleBuyNow = () => {
    // 옵션 유효성 검사
    if (!selectedOption && product.options && product.options.length > 0) {
      alert('옵션을 선택하세요.');
      return;
    }

    // 로그인 체크
    if (!isLoggedIn()) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    // 주문 금액 계산 및 전역 상태 업데이트
    const selectedOpt = product.options?.find(opt => opt.optionNo === Number(selectedOption));
    const unitPrice = product.prdPrice + (selectedOpt?.addPrice || 0);
    const total = unitPrice * quantity;
    
    setOrderSubtotal(total); // 주문 페이지에서 사용할 금액 설정

    // 주문서 페이지로 이동 (상품 정보 전달)
    // state에 주문 모드와 상품 정보를 담아 보냄
    navigate('/order', { 
      state: { 
        mode: 'direct',
        items: [{
          prdNo: product.prdNo,
          prdName: product.prdName,
          optionNo: Number(selectedOption),
          optionName: selectedOpt?.optionName,
          qty: quantity,
          price: unitPrice,
          img: product.imageUrls?.[0]
        }]
      } 
    });
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
        {/* 상품 이미지 갤러리 */}
        <ProductImageGallery
          productName={product.prdName}
          imageUrls={product.imageUrls}
        />

        {/* 상품 핵심 정보 및 구매 액션 (우측 영역) */}
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
      {/* 상세정보/리뷰/배송안내 탭 영역 */}
      <ProductTabs product={product} />
    </div>
  );
}

export default ProductDetailPage;