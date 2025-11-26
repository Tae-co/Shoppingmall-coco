import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/MyCoMate.css";

function MyCoMate() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("following");

  const [coMates, setCoMates] = useState([
    {
      name: "스킨케어전문가",
      avatar: "스",
      tags: ["건성", "쿨톤", "주름", "건조함"],
      reviews: 42,
      isFollowing: true,
    },
    {
      name: "민감피부구원자",
      avatar: "민",
      tags: ["민감성", "중성", "민감함", "홍조"],
      reviews: 28,
      isFollowing: true,
    },
    {
      name: "안티에이징퀸",
      avatar: "안",
      tags: ["건성", "쿨톤", "주름", "탄력"],
      reviews: 56,
      isFollowing: true,
    },
  ]);

  const handleFollowToggle = (index) => {
    setCoMates((prev) =>
      prev.map((mate, i) =>
        i === index ? { ...mate, isFollowing: !mate.isFollowing } : mate
      )
    );
  };

  return (
    <div className="mycomate-container">
      {/* Header */}
      <div className="mycomate-header">
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
        <h1>My Co-mate</h1>
        <p>내 피부 타입에 맞는 Co-mate를 찾아보세요</p>
      </div>

      {/* Tabs */}
      <div className="mycomate-tabs">
        <div
          className={`mycomate-tab ${tab === "following" ? "active" : ""}`}
          onClick={() => setTab("following")}
        >
          팔로잉 ({coMates.filter((m) => m.isFollowing).length})
        </div>
        <div
          className={`mycomate-tab ${tab === "recommended" ? "active" : ""}`}
          onClick={() => setTab("recommended")}
        >
          추천 Co-mates
        </div>
      </div>

      {/* Following tab */}
      {tab === "following" && (
        <div>
          {coMates.map((mate, idx) => (
            <div className="mycomate-card" key={idx}>
              <div className="mycomate-profile">
                <div className="mycomate-avatar">{mate.avatar}</div>
                <div className="mycomate-info">
                  <div className="name">{mate.name}</div>
                  <div className="tags">
                    {mate.tags.map((tag, i) => (
                      <span className="tag" key={i}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="review-count">
                    리뷰 {mate.reviews}개 작성
                  </div>
                </div>
              </div>

              <button
                className="follow-btn"
                onClick={() => handleFollowToggle(idx)}
              >
                👤 {mate.isFollowing ? "팔로잉" : "팔로우"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recommended tab */}
      {tab === "recommended" && (
        <div className="empty-tab-message">
          피부 타입 분석을 기반으로 한 추천 Co-mate를 준비 중이에요 💆‍♀️
        </div>
      )}
    </div>
  );
}

export default MyCoMate;