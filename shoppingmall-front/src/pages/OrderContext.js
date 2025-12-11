import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Context 객체 생성
const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

// 주문 관련 상태를 전역적으로 관리하는 Provider 컴포넌트
export function OrderProvider({ children }) {
  
  // --- 1. OrderPage (배송 정보) 폼 state ---
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  // --- 2. PaymentPage (금액) state ---
  const [orderSubtotal, setOrderSubtotal] = useState(0); // (임시) 상품 금액
  const [userPoints, setUserPoints] = useState(0);       // (임시) 보유 포인트
  const [pointsToUse, setPointsToUse] = useState(0);        // 사용할 포인트

  // --- 3. 배송비(shippingFee) 계산 로직 ---
  const freeShippingThreshold = 30000;
  // 상품 금액(orderSubtotal)이 3만원 이상이면 0원, 아니면 3000원으로 계산
  const calculatedShippingFee = orderSubtotal >= freeShippingThreshold ? 0 : 3000;

  useEffect(() => {
    const fetchMyPoint = async () => {
      const token = localStorage.getItem('token'); // 로그인 토큰 가져오기
      
      // 토큰이 없으면(비로그인) 포인트 조회 안 함
      if (!token) {
        
        return;
      }

      try {
        // 백엔드 API 호출 (GET /api/members/me)
        const response = await axios.get('http://13.231.28.89:18080/api/member/me', {
          headers: {
            'Authorization': `Bearer ${token}` // 헤더에 토큰 실어 보내기
          }
        });

        // 성공 시 포인트 업데이트
        if (response.data && response.data.point !== undefined) {
          
          setUserPoints(response.data.point);
        }

      } catch (error) {
        
        // (선택) 에러 시 처리 로직 (예: 토큰 만료 시 로그아웃 등)
      }
    };

    fetchMyPoint();
  }, []);

 
  const value = {
    lastName, setLastName,
    firstName, setFirstName,
    phone, setPhone,
    postcode, setPostcode,
    address, setAddress,
    addressDetail, setAddressDetail,
    deliveryMessage, setDeliveryMessage,
    
    orderSubtotal, setOrderSubtotal,
    
    // 계산된 배송비를 'shippingFee'로 전달
    shippingFee: calculatedShippingFee, 
    
    userPoints, setUserPoints,
    pointsToUse, setPointsToUse,
    orderItems, setOrderItems,
    cartItems, setCartItems,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}