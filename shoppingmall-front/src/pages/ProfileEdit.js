import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/ProfileEdit.css";
import { getStoredMember } from "../utils/api";
import axios from "axios";

function ProfileEdit() {
  const navigate = useNavigate();

  // 로그인 정보
  const member = getStoredMember();
  const memNo = member?.memNo;

  // 계정 정보
  const [nickname, setNickname] = useState(member?.memNickname || "");
  const [email] = useState(member?.memMail || "");

  // 상태값
  const [skinType, setSkinType] = useState("");
  const [concerns, setConcerns] = useState([]);
  const [personalColor, setPersonalColor] = useState("");

  // 기존 데이터 불러오기
  useEffect(() => {
    if (!memNo) return;

    axios
      .get(`http://localhost:8080/api/coco/members/profile/${memNo}`)
      .then((res) => {
        const data = res.data;
        console.log("프로필 조회 성공:", data);

        setSkinType(data.skinType || "");
        setPersonalColor(data.personalColor || "");

        if (Array.isArray(data.concerns)) {
          setConcerns(data.concerns);
        }
      })
      .catch((err) => {
        console.error("프로필 조회 실패:", err);
      });
  }, [memNo]);

  // 체크박스 핸들러
  const handleConcernChange = (e) => {
    const value = e.target.value;
    setConcerns((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // 저장하기
  const handleSave = () => {
    if (!memNo) {
      alert("로그인이 필요합니다!");
      return;
    }

    const requestBody = {
      skinType,
      concerns,
      personalColor,
    };

    axios
      .put(
        `http://localhost:8080/api/coco/members/profile/${memNo}`,
        requestBody
      )
      .then(() => {
        alert("프로필이 성공적으로 저장되었습니다!");
        navigate("/mypage");
      })
      .catch((err) => {
        console.error("프로필 저장 실패:", err);
        alert("저장 중 오류가 발생했습니다.");
      });
  };

  return (
    <div className="profile-edit-container">
      {/* 뒤로가기 */}
      <button className="back-btn" onClick={() => navigate("/mypage")}>
        ← 마이페이지로 돌아가기
      </button>

      <h2 className="page-title">프로필 설정</h2>

      {/* 계정 정보 */}
      <div className="section">
        <h3>계정 정보</h3>

        <label>닉네임</label>
        <div className="input-row">
          <input
            type="text"
            className="input readonly"
            value={nickname} 
            readOnly
          />
        </div>

        <label>이메일 (ID)</label>
        <input type="email" className="input readonly" value={email} readOnly />
      </div>

      {/* 피부 프로필 */}
      <div className="section">
        <h3>피부 프로필</h3>
        <p className="section-desc">
          이 정보는 <b>‘Filter by My Profile’</b> 기능과 Co-mate 추천에 사용됩니다.
        </p>

        {/* 피부 타입 */}
        <div className="sub-section">
          <h4>피부 타입</h4>
          <div className="option-grid">
            {["지성", "건성", "복합성", "민감성"].map((type) => (
              <label key={type}>
                <input
                  type="radio"
                  name="skinType"
                  value={type}
                  checked={skinType === type}
                  onChange={(e) => setSkinType(e.target.value)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* 피부 고민 */}
        <div className="sub-section">
          <h4>피부 고민 (복수 선택 가능)</h4>
          <div className="option-grid checkbox">
            {[
              "모공",
              "여드름",
              "홍조",
              "주름",
              "건조함",
              "민감함",
              "다크스팟",
              "칙칙함",
            ].map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  value={item}
                  checked={concerns.includes(item)}
                  onChange={handleConcernChange}
                />
                {item}
              </label>
            ))}
          </div>
        </div>

        {/* 퍼스널 컬러 */}
        <div className="sub-section">
          <h4>퍼스널 컬러</h4>
          <select
            className="select"
            value={personalColor}
            onChange={(e) => setPersonalColor(e.target.value)}
          >
            <option value="">선택하세요</option>
            <option>봄 웜톤</option>
            <option>여름 쿨톤</option>
            <option>가을 웜톤</option>
            <option>겨울 쿨톤</option>
          </select>
        </div>
      </div>

      {/* 저장 버튼 */}
      <button className="save-btn" onClick={handleSave}>
        변경사항 저장
      </button>
    </div>
  );
}

export default ProfileEdit;