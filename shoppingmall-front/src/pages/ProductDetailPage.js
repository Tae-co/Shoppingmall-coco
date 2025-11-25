import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import ProductDetailSkeleton from '../components/product/detail/ProductDetailSkeleton';
import ProductImageGallery from '../components/product/detail/ProductImageGallery';
import ProductInfoBox from '../components/product/detail/ProductInfoBox';
import ProductTabs from '../components/product/detail/ProductTabs';
import { fetchWithAuth, getStoredMember, isLoggedIn } from '../utils/api';


// --- 스타일 컴포넌트 정의 ---

// 토스트 알림을 위한 애니메이션 정의
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  to {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
`;

const Container = styled.div`
  padding: 40px 20px;
  max-width: 1024px;
  margin: 0 auto;
`;

const BackButtonContainer = styled.div`
  width: 100%;
  text-align: left;
`;

const BackButton = styled.button`
  background: none;
  border: 1px solid #ddd;
  padding: 8px 15px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background 0.2s;

  &:hover {
    background: #f9f9f9;
  }
`;

const TopSection = styled.div`
  display: flex;
  gap: 40px;

  /* 모바일 반응형: 화면이 768px보다 좁아지면 세로로 쌓임 */
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// 토스트 알림 스타일 컴포넌트
const Toast = styled.div`
  position: fixed; /* 화면에 고정 */
  bottom: 30px; /* 화면 하단에 */
  left: 50%; /* 가로 중앙 정렬 */
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 15px;
  z-index: 2000;
  
  /* $visible prop에 따라 애니메이션 적용 */
  visibility: ${props => (props.$visible ? 'visible' : 'hidden')};
  opacity: ${props => (props.$visible ? 1 : 0)};
  animation: ${props => (props.$visible ? fadeIn : fadeOut)} 0.3s ease-in-out;
  transition: visibility 0.3s, opacity 0.3s;
`;

// ---------------------------------

function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState('');
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  // productId가 바뀔 때마다 실행
  useEffect(() => {
    const fetchProductDetail = async () => {
      setIsLoading(true);
      try {
        // 실제 API 호출
        const response = await fetch(`http://localhost:8080/api/products/${productId}`);
        if (!response.ok) {
          throw new Error('상품 정보를 찾을 수 없습니다.');
        }
        const data = await response.json();

        setProduct(data);

      } catch (error) {
        console.error(error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetail();

  }, [productId]);

  // 토스트 메시지가 나타나면 2초 후에 사라지도록 하는 useEffect
  useEffect(() => {
    if (toastMessage) {
      // 메시지가 있으면 2초(2000ms) 타이머 설정
      const timer = setTimeout(() => {
        setToastMessage(''); // 2초 후 메시지 지우기
      }, 2000);

      // 컴포넌트가 언마운트되거나 메시지가 바뀌면 타이머 정리
      return () => clearTimeout(timer);
    }
  }, [toastMessage]); // toastMessage가 변경될 때마다 이 훅이 실행됨

  // 뒤로가기 버튼 클릭 핸들러
  const handleBack = () => {
    navigate(-1); // 브라우저의 '뒤로가기'와 동일하게 동작
  };

  // 버튼 핸들러
  const handleAddToCart = async () => {

    // 로그인 확인
    if (!isLoggedIn()) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    // 회원 정보 가져오기 
    const member = getStoredMember();
    if (!member || !member.memNo) {
      alert('회원 정보를 찾을 수 없습니다.');
      return;
    }

    // 옵션 번호 결정
    let optionNoToUse;

    // 옵션 목록이 존재하는지 확인
    const hasOptions = product.options && product.options.length > 0;

    if (selectedOption) {
      // 사용자가 옵션을 선택한 경우
      optionNoToUse = Number(selectedOption);
    } else if (hasOptions) {
      // 옵션을 선택하지 않았지만, 상품에 옵션이 있는 경우
      alert('옵션을 선택하세요.');
      return;
    } else {
      alert('상품 옵션 정보가 없습니다. 관리자에게 문의하세요.');
      return;
    }

    try {
      // API 호출 (CartRequestDto 형식에 맞춤)
      const response = await fetchWithAuth('/coco/members/cart/items', {
        method: 'POST',
        body: JSON.stringify({
          memNo: member.memNo,
          optionNo: optionNoToUse,
          cartQty: quantity
        })
      });

      if (response.ok) {
        setToastMessage('장바구니에 상품을 담았습니다.');

        if (window.confirm('장바구니로 이동하시겠습니까?')) { navigate('/cart'); }
      } else {
        const errorData = await response.json();
        alert(errorData.message || '장바구니 담기에 실패했습니다.');
      }
    } catch (error) {
      console.error(error);
      alert('오류가 발생했습니다.');
    }
  };

  const handleBuyNow = () => {
    if (!selectedOption && product.options.length > 0) {
      alert('옵션을 선택하세요.');
      return;
    }
    // 실제 기능 연결 대신 "준비 중" 알림 띄우기
    alert("바로구매 기능은 현재 준비 중입니다.\n장바구니를 이용해 주세요.");

    console.log(`[주문 담당] ${product.prdName}, 옵션: ${selectedOption}, 수량: ${quantity} 바로구매`);
  };

  // 로딩 중 또는 상품이 없을 때
  if (isLoading) {
    return (
      <Container>
        <BackButtonContainer>
          <BackButton onClick={handleBack}>&lt; 뒤로가기</BackButton>
        </BackButtonContainer>
        <ProductDetailSkeleton />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container>
        <BackButtonContainer>
          <BackButton onClick={handleBack}>&lt; 뒤로가기</BackButton>
        </BackButtonContainer>
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888' }}>
          <h3>상품을 찾을 수 없습니다</h3>
          <p>URL을 다시 확인해주세요.</p>
        </div>
      </Container>
    );
  }

  // 상품 정보 렌더링
  return (
    <Container>
      {/* 토스트 컴포넌트 렌더링 */}
      <Toast $visible={!!toastMessage}>{toastMessage}</Toast>

      <BackButtonContainer>
        <BackButton onClick={handleBack}>&lt; 뒤로가기</BackButton>
      </BackButtonContainer>

      <TopSection>
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
      </TopSection>
      <ProductTabs product={product} />

    </Container>
  );
}

export default ProductDetailPage;
