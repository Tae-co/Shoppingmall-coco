import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AccountSettings.css";
import { changePassword, deleteAccount, logout } from "../utils/api";

function AccountSettings() {
  const navigate = useNavigate();

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [deletePw, setDeletePw] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    order: true,
    promo: false,
    review: true,
    comate: true,
  });

  const handleToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handlePasswordChange = async () => {
    setError("");

    // 유효성 검사
    if (!currentPw || !newPw || !confirmPw) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    if (newPw.length < 8) {
      setError("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (newPw !== confirmPw) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (currentPw === newPw) {
      setError("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPw, newPw);
      alert("비밀번호가 성공적으로 변경되었습니다.");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setError("");
    } catch (error) {
      setError(error.message || "비밀번호 변경에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");

    if (!deletePw) {
      setDeleteError("현재 비밀번호를 입력해주세요.");
      return;
    }

    if (!window.confirm("정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount(deletePw);
      alert("계정이 삭제되었습니다.");
      logout();
      navigate("/");
    } catch (error) {
      setDeleteError(error.message || "계정 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="account-settings-container">
      <button className="back-btn" onClick={() => navigate("/mypage")}>
        ← 마이페이지로 돌아가기
      </button>

      <h2 className="page-title">계정 설정</h2>

      {/* 비밀번호 변경 */}
      <section className="setting-section">
        <h3>비밀번호 변경</h3>
        <p className="section-desc">
          정기적인 비밀번호 변경으로 계정을 안전하게 보호하세요
        </p>

        <div className="input-group">
          <input
            type="password"
            placeholder="현재 비밀번호를 입력하세요"
            value={currentPw}
            onChange={(e) => {
              setCurrentPw(e.target.value);
              setError("");
            }}
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="새 비밀번호 (최소 8자 이상)"
            value={newPw}
            onChange={(e) => {
              setNewPw(e.target.value);
              setError("");
            }}
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="새 비밀번호를 다시 입력하세요"
            value={confirmPw}
            onChange={(e) => {
              setConfirmPw(e.target.value);
              setError("");
            }}
            disabled={isLoading}
          />
        </div>

        {error && (
          <div style={{ color: "red", marginBottom: "10px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <button 
          className="change-btn" 
          onClick={handlePasswordChange}
          disabled={isLoading}
        >
          {isLoading ? "변경 중..." : "비밀번호 변경"}
        </button>
      </section>

      {/* 알림 설정 */}
      <section className="setting-section">
        <h3>알림 설정</h3>
        <p className="section-desc">받고 싶은 알림을 선택하세요</p>

        <div className="notify-item">
          <span>이메일 알림</span>
          <p>주문 및 배송 관련 이메일을 받습니다</p>
          <label className="switch">
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={() => handleToggle("email")}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="notify-item">
          <span>주문 업데이트</span>
          <p>주문 상태 변경 알림을 받습니다</p>
          <label className="switch">
            <input
              type="checkbox"
              checked={notifications.order}
              onChange={() => handleToggle("order")}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="notify-item">
          <span>프로모션 및 혜택</span>
          <p>특별 할인 및 이벤트 알림을 받습니다</p>
          <label className="switch">
            <input
              type="checkbox"
              checked={notifications.promo}
              onChange={() => handleToggle("promo")}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="notify-item">
          <span>리뷰 알림</span>
          <p>내 리뷰에 대한 반응 알림을 받습니다</p>
          <label className="switch">
            <input
              type="checkbox"
              checked={notifications.review}
              onChange={() => handleToggle("review")}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="notify-item">
          <span>Co-mate 활동</span>
          <p>Co-mate 팔로우 및 리뷰 알림을 받습니다</p>
          <label className="switch">
            <input
              type="checkbox"
              checked={notifications.comate}
              onChange={() => handleToggle("comate")}
            />
            <span className="slider"></span>
          </label>
        </div>
      </section>

      {/* 개인정보 보호 */}
      <section className="setting-section">
        <h3>개인정보 보호</h3>
        <p className="section-desc">계정 보안 및 개인정보 관리</p>

        <div className="privacy-btns">
          <button>개인정보 처리방침</button>
          <button>이용약관</button>
        </div>
      </section>

      {/* 계정 삭제 */}
      <section className="setting-section danger">
        <h3>계정 삭제</h3>
        <p className="section-desc">
          계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다
        </p>
        <div className="input-group">
          <input
            type="password"
            placeholder="현재 비밀번호를 입력하세요"
            value={deletePw}
            onChange={(e) => {
              setDeletePw(e.target.value);
              setDeleteError("");
            }}
            disabled={isDeleting}
          />
        </div>
        {deleteError && (
          <div style={{ color: "red", marginBottom: "10px", fontSize: "14px" }}>
            {deleteError}
          </div>
        )}
        <button
          className="delete-btn"
          onClick={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? "삭제 중..." : "계정 삭제하기"}
        </button>
      </section>
    </div>
  );
}

export default AccountSettings;