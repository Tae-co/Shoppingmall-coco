import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Cart.css";
import OrderSteps from "../components/OrderSteps.js";
import { getStoredMember } from "../utils/api";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const member = getStoredMember();
  const memNo = member ? member.memNo : null;

  // 장바구니 목록 불러오기
  useEffect(() => {
    if (!memNo) {
      alert("로그인이 필요합니다.");
      return;
    }

    axios
      .get(`http://localhost:8080/api/coco/members/cart/items/${memNo}`)
      .then((res) => {
        setCartItems(res.data);
        console.log("장바구니 불러오기 성공:", res.data);

        // 헤더에 장바구니 변경 알림
        window.dispatchEvent(new Event("cartUpdated"));
      })
      .catch((err) => {
        console.error("장바구니 불러오기 실패:", err);
      });
  }, [memNo]);

  // 수량 증가 / 감소
  const updateQuantity = (cartNo, newQty) => {
    axios
      .patch(`http://localhost:8080/api/coco/members/cart/items/${cartNo}`, {
        qty: newQty,
      })
      .then((res) => {
        setCartItems((prev) =>
          prev.map((item) =>
            item.cartNo === cartNo
              ? { ...item, cartQty: res.data.cartQty }
              : item
          )
        );
      })
      .catch((err) => console.error("수량 변경 실패:", err));
  };

  const increaseQuantity = (cartNo, currentQty) => {
    updateQuantity(cartNo, currentQty + 1);
  };

  const decreaseQuantity = (cartNo, currentQty) => {
    if (currentQty > 1) {
      updateQuantity(cartNo, currentQty - 1);
    }
  };

  // 장바구니 항목 삭제
  const removeItem = (cartNo) => {
    axios
      .delete(`http://localhost:8080/api/coco/members/cart/items/${cartNo}`)
      .then(() => {
        setCartItems((prev) => prev.filter((item) => item.cartNo !== cartNo));

        // 삭제 후 헤더 업데이트
        window.dispatchEvent(new Event("cartUpdated"));
      })
      .catch((err) => console.error("삭제 실패:", err));
  };

  // 전체 비우기
  const clearCart = () => {
    axios
      .delete(
        `http://localhost:8080/api/coco/members/cart/items/clear/${memNo}`
      )
      .then(() => {
        setCartItems([]);

        // 전체 비우기 후 헤더 업데이트
        window.dispatchEvent(new Event("cartUpdated"));
      })
      .catch((err) => console.error("전체 삭제 실패:", err));
  };

  // 총 금액 계산
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.productPrice * item.cartQty,
    0
  );

  // 주문 버튼
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("장바구니가 비어 있습니다.");
      return;
    }
    alert("주문 페이지로 이동합니다 (추후 구현)");
    // navigate("/order", { state: { items: cartItems } });
  };

  // 렌더링
  return (
    <div className="order-page">
      <h2 className="order-title">주문하기</h2>

      <div className="order-content-area">
        <OrderSteps currentStep={1} />

        <div className="cart-grid">
          {/* 장바구니 목록 */}
          <div className="cart-list">
            <h3 className="section-title">장바구니 ({cartItems.length})</h3>

            {cartItems.length === 0 ? (
              <p className="empty-cart">장바구니가 비어 있습니다.</p>
            ) : (
              cartItems.map((item) => (
                <div key={item.cartNo} className="cart-card">
                  <img
                    src={item.productImage || "/images/no-image.png"}
                    alt={item.productName}
                    className="cart-image"
                  />
                  <div className="cart-info">
                    <p className="brand">{item.productName}</p>
                    <p className="price">
                      {item.productPrice.toLocaleString()}원
                    </p>
                    <div className="quantity-box">
                      <button
                        onClick={() =>
                          decreaseQuantity(item.cartNo, item.cartQty)
                        }
                      >
                        -
                      </button>
                      <span>{item.cartQty}</span>
                      <button
                        onClick={() =>
                          increaseQuantity(item.cartNo, item.cartQty)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-summary-item">
                    <p className="subtotal">
                      소계:{" "}
                      {(item.productPrice * item.cartQty).toLocaleString()}원
                    </p>
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.cartNo)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 주문 요약 */}
          <div className="order-summary">
            <h3>주문 요약</h3>
            <div className="summary-row">
              <span>상품 금액</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
            <div className="summary-row">
              <span>배송비</span>
              <span>무료</span>
            </div>
            <hr />
            <div className="summary-row total">
              <span>총 결제 금액</span>
              <strong>{totalPrice.toLocaleString()}원</strong>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              주문하기
            </button>
            <button
              className="checkout-btn"
              style={{ backgroundColor: "#ccc", marginTop: "8px" }}
              onClick={clearCart}
            >
              전체 비우기
            </button>
            <p className="summary-note">
              * 주문 전 재고 확인이 필요할 수 있습니다.
              <br />* 배송은 영업일 기준 2~3일 소요됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;