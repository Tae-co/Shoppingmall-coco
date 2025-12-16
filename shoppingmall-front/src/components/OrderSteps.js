import React from "react";
import "../css/OrderSteps.css";

function OrderSteps({ currentStep = 1 }) {
  const steps = [
    { id: 1, title: "장바구니", desc: "상품 확인" },
    { id: 2, title: "배송 정보", desc: "배송지 입력" },
    { id: 3, title: "결제", desc: "결제 수단 선택" },
    { id: 4, title: "주문 완료", desc: "주문 확인" },
  ];

  return (
    <div className="order-steps">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="step">
            <div
              className={`circle 
                ${currentStep === step.id ? "active" : ""}
                ${currentStep > step.id ? "completed" : ""}
              `}
            >
              {currentStep > step.id ? "✓" : step.id}
            </div>
            <div className="step-text">
              <p className="step-title">{step.title}</p>
              <p className="step-desc">{step.desc}</p>
            </div>
          </div>

          {/* 선 표시 */}
          {index < steps.length - 1 && (
            <div
              className={`line ${
                currentStep > step.id ? "completed-line" : ""
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default OrderSteps;