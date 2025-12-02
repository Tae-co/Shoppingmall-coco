import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AccountSettings.css";
import { changePassword, deleteAccount, logout, updateMember, getCurrentMember, getStoredMember } from "../utils/api";
import SignupTermsPopup from "../components/SignupTermsPopup";

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

  // 배송정보 상태
  const [deliveryInfo, setDeliveryInfo] = useState({
    memHp: "",
    memZipcode: "",
    memAddress1: "",
    memAddress2: "",
  });
  const [isUpdatingDelivery, setIsUpdatingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");

  // 약관 팝업 상태
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [termsType, setTermsType] = useState(null);

  // 배송정보 초기 로드
  useEffect(() => {
    const loadDeliveryInfo = async () => {
      try {
        const member = await getCurrentMember();
        setDeliveryInfo({
          memHp: member.memHp || "",
          memZipcode: member.memZipcode || "",
          memAddress1: member.memAddress1 || "",
          memAddress2: member.memAddress2 || "",
        });
      } catch (error) {
        // 백엔드 호출 실패 시 localStorage에서 가져오기
        const member = getStoredMember();
        if (member) {
          setDeliveryInfo({
            memHp: member.memHp || "",
            memZipcode: member.memZipcode || "",
            memAddress1: member.memAddress1 || "",
            memAddress2: member.memAddress2 || "",
          });
        }
      }
    };
    loadDeliveryInfo();
  }, []);

  // 주소 검색 (다음 주소 API)
  const handleAddressSearch = () => {
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function(data) {
          let addr = '';
          
          if (data.userSelectedType === 'R') {
            addr = data.roadAddress;
          } else {
            addr = data.jibunAddress;
          }

          setDeliveryInfo(prev => ({
            ...prev,
            memZipcode: data.zonecode,
            memAddress1: addr
          }));
          
          document.getElementById('delivery-address2')?.focus();
        }
      }).open();
    } else {
      alert('주소 검색 서비스를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
    }
  };

  // 배송정보 입력 변경
  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({
      ...prev,
      [name]: value
    }));
    setDeliveryError("");
  };

  // 배송정보 수정
  const handleUpdateDelivery = async () => {
    setDeliveryError("");

    // 유효성 검사
    if (!deliveryInfo.memHp || !deliveryInfo.memHp.trim()) {
      setDeliveryError("전화번호를 입력해주세요.");
      return;
    }

    if (!deliveryInfo.memZipcode || !deliveryInfo.memAddress1) {
      setDeliveryError("주소를 검색해주세요.");
      return;
    }

    setIsUpdatingDelivery(true);
    try {
      const updatedMember = await updateMember({
        memHp: deliveryInfo.memHp,
        memZipcode: deliveryInfo.memZipcode,
        memAddress1: deliveryInfo.memAddress1,
        memAddress2: deliveryInfo.memAddress2 || "",
      });
      
      alert("배송정보가 성공적으로 수정되었습니다.");
      
      // localStorage 업데이트
      const currentMember = getStoredMember();
      if (currentMember) {
        const updatedData = {
          ...currentMember,
          memHp: updatedMember.memHp,
          memZipcode: updatedMember.memZipcode,
          memAddress1: updatedMember.memAddress1,
          memAddress2: updatedMember.memAddress2,
        };
        localStorage.setItem('member', JSON.stringify(updatedData));
        window.dispatchEvent(new Event('loginStatusChanged'));
      }
    } catch (error) {
      setDeliveryError(error.message || "배송정보 수정에 실패했습니다.");
    } finally {
      setIsUpdatingDelivery(false);
    }
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

      {/* 배송정보 수정 */}
      <section className="setting-section">
        <h3>배송정보 수정</h3>
        <p className="section-desc">
          주문 시 사용할 배송지 정보를 수정할 수 있습니다
        </p>

        <div className="input-group">
          <input
            type="text"
            name="memHp"
            placeholder="전화번호를 입력하세요 (예: 010-1234-5678)"
            value={deliveryInfo.memHp}
            onChange={handleDeliveryChange}
            disabled={isUpdatingDelivery}
          />
          <div className="input-with-button">
            <input
              type="text"
              name="memZipcode"
              placeholder="우편번호"
              value={deliveryInfo.memZipcode}
              onChange={handleDeliveryChange}
              readOnly
              disabled={isUpdatingDelivery}
            />
            <button
              type="button"
              className="check-button"
              onClick={handleAddressSearch}
              disabled={isUpdatingDelivery}
            >
              주소검색
            </button>
          </div>
          <input
            type="text"
            name="memAddress1"
            placeholder="기본주소"
            value={deliveryInfo.memAddress1}
            onChange={handleDeliveryChange}
            readOnly
            disabled={isUpdatingDelivery}
          />
          <input
            type="text"
            id="delivery-address2"
            name="memAddress2"
            placeholder="상세주소를 입력하세요"
            value={deliveryInfo.memAddress2}
            onChange={handleDeliveryChange}
            disabled={isUpdatingDelivery}
          />
        </div>

        {deliveryError && (
          <div className="error-message">
            {deliveryError}
          </div>
        )}

        <button 
          className="change-btn" 
          onClick={handleUpdateDelivery}
          disabled={isUpdatingDelivery}
        >
          {isUpdatingDelivery ? "수정 중..." : "배송정보 수정"}
        </button>
      </section>

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
          <div className="error-message">
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

      {/* 개인정보 보호 */}
      <section className="setting-section">
        <h3>개인정보 보호</h3>
        <p className="section-desc">계정 보안 및 개인정보 관리</p>

        <div className="privacy-btns">
          <button onClick={() => {
            setTermsType('privacy');
            setShowTermsPopup(true);
          }}>
            개인정보 처리방침
          </button>
          <button onClick={() => {
            setTermsType('service');
            setShowTermsPopup(true);
          }}>
            이용약관
          </button>
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
          <div className="error-message">
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

      {/* 약관 팝업 */}
      {showTermsPopup && (
        <SignupTermsPopup
          type={termsType}
          onClose={() => {
            setShowTermsPopup(false);
            setTermsType(null);
          }}
        />
      )}
    </div>
  );
}

export default AccountSettings;