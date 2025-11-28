import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Cart.css";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const navigate = useNavigate();

  // JWT 토큰 가져오기
  const token = localStorage.getItem("token");

  // 장바구니 목록 불러오기
  useEffect(() => {
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    axios
      .get("http://localhost:8080/api/coco/members/cart/items", {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      })
      .then((res) => {
        setCartItems(res.data);
        setSelectedItems(res.data.map((item) => item.cartNo)); // 초기 전체 선택
        window.dispatchEvent(new Event("cartUpdated"));
      })
      .catch((err) => console.error("장바구니 불러오기 실패:", err));
  }, [token]);

  // 체크박스 로직
  const toggleSelectItem = (cartNo) => {
    setSelectedItems((prev) =>
      prev.includes(cartNo)
        ? prev.filter((id) => id !== cartNo)
        : [...prev, cartNo]
    );
  };

  const selectAll = () => {
    setSelectedItems(cartItems.map((item) => item.cartNo));
  };

  const unselectAll = () => {
    setSelectedItems([]);
  };

  const isAllSelected =
    cartItems.length > 0 && selectedItems.length === cartItems.length;

  // 선택된 금액 계산
  const selectedTotalPrice = cartItems
    .filter((item) => selectedItems.includes(item.cartNo))
    .reduce((total, item) => total + item.productPrice * item.cartQty, 0);

  // 수량 변경
  const updateQuantity = (cartNo, newQty) => {
    axios
      .patch(
        `http://localhost:8080/api/coco/members/cart/items/${cartNo}`,
        { qty: newQty },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      )
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

  const increaseQuantity = (cartNo, currentQty) =>
    updateQuantity(cartNo, currentQty + 1);

  const decreaseQuantity = (cartNo, currentQty) => {
    if (currentQty > 1) updateQuantity(cartNo, currentQty - 1);
  };

  // 단일 삭제
  const removeItem = (cartNo) => {
    const ok = window.confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    axios
      .delete(
        `http://localhost:8080/api/coco/members/cart/items/${cartNo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      )
      .then(() => {
        setCartItems((prev) => prev.filter((i) => i.cartNo !== cartNo));
        setSelectedItems((prev) => prev.filter((id) => id !== cartNo));
        window.dispatchEvent(new Event("cartUpdated"));
      })
      .catch((err) => console.error("삭제 실패:", err));
  };

  // 선택 삭제
  const removeSelectedItems = () => {
    if (selectedItems.length === 0) {
      alert("삭제할 상품을 선택해주세요.");
      return;
    }

    const ok = window.confirm("선택한 상품을 삭제하시겠습니까?");
    if (!ok) return;

    Promise.all(
      selectedItems.map((cartNo) =>
        axios.delete(
          `http://localhost:8080/api/coco/members/cart/items/${cartNo}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      )
    )
      .then(() => {
        setCartItems((prev) =>
          prev.filter((item) => !selectedItems.includes(item.cartNo))
        );
        setSelectedItems([]);
        window.dispatchEvent(new Event("cartUpdated"));
      })
      .catch((err) => console.error("선택 삭제 실패:", err));
  };

  // 주문하기 > 배송 정보 페이지로 이동
  const handleCheckoutSelected = () => {
    if (selectedItems.length === 0) {
      alert("주문할 상품을 선택해주세요.");
      return;
    }
   const selectedCartItems = cartItems.filter(item =>
      selectedItems.includes(item.cartNo)
    );

    const subtotal = selectedTotalPrice;
    const shippingFee = subtotal >= 30000 ? 0 : 3000;

    navigate("/order", {
      state: {
        orderItems: selectedCartItems,
        orderSubtotal: subtotal,
        shippingFee: shippingFee,
      },
    });
  };

  // 전체 주문하기
  const handleCheckoutAll = () => {
    if (cartItems.length === 0) {
      alert("장바구니가 비어 있습니다.");
      return;
    }

    const subtotal = cartItems.reduce(
      (total, item) => total + item.productPrice * item.cartQty,
      0
    );
    const shippingFee = subtotal >= 30000 ? 0 : 3000;

    navigate("/order", {
      state: {
        orderItems: cartItems,
        orderSubtotal: subtotal,
        shippingFee: shippingFee,
      },
    });
  };

  return (
    <div className="order-page">
     <h1 className="order-title">장바구니</h1>

      <div className="order-content-area">
        {/*<OrderSteps currentStep={1} />*/}

        <div className="cart-grid">
          {/* 장바구니 */}
          <div className="cart-list">
            <h3 className="section-title">장바구니 ({cartItems.length})</h3>

            <div className="select-controls">
              <label className="select-label">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={() => {
                    isAllSelected ? unselectAll() : selectAll();
                  }}
                />
                전체 선택
              </label>

              <button
                className="delete-selected-btn"
                onClick={removeSelectedItems}
              >
                선택 삭제
              </button>
            </div>

            {/* 장바구니 목록 */}
            <div className="cart-scroll-area">
              {cartItems.length === 0 ? (
                <p className="empty-cart">장바구니가 비어 있습니다.</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.cartNo} className="cart-card">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.cartNo)}
                      onChange={() => toggleSelectItem(item.cartNo)}
                      className="item-checkbox"
                    />

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
          </div>

          {/* 주문 요약 */}
          <div className="order-summary">
            <h3>결제 금액</h3>

            {/* 선택된 상품 금액 */}
            <div className="summary-row">
              <span>상품 금액</span>
              <span>{selectedTotalPrice.toLocaleString()}원</span>
            </div>

            {/* 선택된 금액 기준 배송비 산정 */}
            <div className="summary-row">
              <span>배송비</span>
              <strong>
                {(selectedTotalPrice >= 30000 ? 0 : 3000).toLocaleString()}원
              </strong>
            </div>

            {/* 총 구매 금액 */}
            <div className="summary-row total">
              <span>총 구매 금액</span>
              <strong>
                {(
                  selectedTotalPrice +
                  (selectedTotalPrice >= 30000 ? 0 : 3000)
                ).toLocaleString()}
                원
              </strong>
            </div>

            <hr />

            <button className="checkout-btn" onClick={handleCheckoutSelected}>
              선택 주문하기 ({selectedItems.length})
            </button>

            <button className="checkout-btn" onClick={handleCheckoutAll}>
              전체 주문하기
            </button>

            <p className="summary-note">
              * 주문 전 재고 확인이 필요할 수 있습니다.<br />
              * 배송은 영업일 기준 2~3일 소요됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;