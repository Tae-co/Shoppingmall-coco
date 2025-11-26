import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/MyActivity.css";

function MyActivity() {
  const navigate = useNavigate();

  const reviews = [
    {
      id: 1,
      name: "히알루론산 인텐시브 세럼",
      rating: 5,
      date: "2024.10.28",
      tags: ["수분감 최고", "흡수 빠름", "재구매"],
      content:
        "정말 최고의 세럼이에요! 사용한 지 2주 정도 되었는데 피부가 정말 촉촉해지고 탄력이 생겼어요.",
      image: "/images/serum.jpg",
    },
    {
      id: 2,
      name: "비타민C 브라이트닝 토너",
      rating: 4,
      date: "2024.10.20",
      tags: ["브라이트닝", "피부톤"],
      content: "피부톤이 환해진 것 같아요. 매일 사용하고 있습니다.",
      image: "/images/toner.jpg",
    },
    {
      id: 3,
      name: "센텔라 진정 크림",
      rating: 5,
      date: "2024.10.15",
      tags: ["민감피부OK", "진정효과"],
      content: "민감한 피부에 완벽해요! 자극 없이 진정되는 느낌이에요.",
      image: "/images/cream.jpg",
    },
  ];

  return (
    <div className="review-activity-container">
      {/* 상단 */}
      {/* 뒤로가기 */}
      <button className="back-btn" onClick={() => navigate("/mypage")}>
        <svg
          className="arrow-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5"  y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      <span>마이페이지로 돌아가기</span></button>
      <h2 className="page-title">내 활동</h2>

      {/* 리뷰 목록 */}
      <div className="review-list">
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <img src={review.image} alt={review.name} className="review-img" />
              <div className="review-info">
                <p className="review-name">{review.name}</p>

                {/* 별점 표시 */}
                <p className="review-rating">
                    {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={i < review.rating ? "star filled" : "star"}>
                    ★
                </span>
                ))}
                <span className="review-date">{review.date}</span>
                </p>
              </div>
            </div>

            {/* 태그 */}
            <div className="review-tags">
              {review.tags.map((tag, idx) => (
                <span key={idx} className="review-tag">
                  {tag}
                </span>
              ))}
            </div>

            {/* 내용 */}
            <p className="review-content">{review.content}</p>

            {/* 수정 / 삭제 아이콘 */}
            <div className="review-actions">
              <button className="edit-btn">🖉</button>
              <button className="delete-btn">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyActivity;