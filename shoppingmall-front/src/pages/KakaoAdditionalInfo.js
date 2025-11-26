import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/KakaoAdditionalInfo.css';
import { updateMember, isLoggedIn, validateEmail, storage, STORAGE_KEYS, checkSkinProfile, getStoredMember } from '../utils/api';
import SkinProfilePopup from '../components/SkinProfilePopup';

const KakaoAdditionalInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    memNickname: '',
    memMail: '',
    memHp: '',
    memZipcode: '',
    memAddress1: '',
    memAddress2: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkinProfilePopup, setShowSkinProfilePopup] = useState(false);

  // 입력 필드 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 다음 주소 API를 통한 주소 검색 처리
  const handleAddressSearch = () => {
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function(data) {
          setFormData(prev => ({
            ...prev,
            memZipcode: data.zonecode,
            memAddress1: data.address
          }));
        }
      }).open();
    } else {
      alert('주소 검색 서비스를 불러올 수 없습니다.');
    }
  };

  // 추가 정보 입력 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.memNickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    if (!formData.memMail.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }
    if (!formData.memHp.trim()) {
      alert('전화번호를 입력해주세요.');
      return;
    }

    if (!validateEmail(formData.memMail)) {
      alert('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    if (!isLoggedIn()) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await updateMember(formData);
      storage.set(STORAGE_KEYS.MEMBER, JSON.stringify(data));
      alert('추가 정보가 입력되었습니다.');
      window.dispatchEvent(new Event('loginStatusChanged'));
      
      // 스킨 프로필 확인
      const member = getStoredMember();
      const isAdmin = (member?.role || '').toUpperCase() === 'ADMIN';

      if (member?.memNo && !isAdmin) {
        const hasProfile = await checkSkinProfile(member.memNo);
        if (!hasProfile) {
          setShowSkinProfilePopup(true);
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('정보 입력 오류:', error);
      alert(error.message || '정보 입력 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="additional-info-container">
      <div className="additional-info-card">
        <header className="additional-info-header">
          <h1 className="additional-info-title">Coco</h1>
          <p className="additional-info-subtitle">추가 정보를 입력해주세요</p>
        </header>

        <form onSubmit={handleSubmit} className="additional-info-form">
          <div className="input-group">
            <label>닉네임 *</label>
            <input
              type="text"
              name="memNickname"
              placeholder="닉네임을 입력하세요"
              value={formData.memNickname}
              onChange={handleInputChange}
              className="additional-info-input"
              required
            />
          </div>

          <div className="input-group">
            <label>이메일 *</label>
            <input
              type="email"
              name="memMail"
              placeholder="이메일을 입력하세요"
              value={formData.memMail}
              onChange={handleInputChange}
              className="additional-info-input"
              required
            />
          </div>

          <div className="input-group">
            <label>전화번호 *</label>
            <input
              type="tel"
              name="memHp"
              placeholder="전화번호를 입력하세요"
              value={formData.memHp}
              onChange={handleInputChange}
              className="additional-info-input"
              required
            />
          </div>

          <div className="input-group">
            <label>우편번호</label>
            <div className="address-search-row">
              <input
                type="text"
                name="memZipcode"
                placeholder="우편번호"
                value={formData.memZipcode}
                onChange={handleInputChange}
                className="additional-info-input"
                readOnly
              />
              <button
                type="button"
                onClick={handleAddressSearch}
                className="address-search-button"
              >
                주소 검색
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>주소</label>
            <input
              type="text"
              name="memAddress1"
              placeholder="주소"
              value={formData.memAddress1}
              onChange={handleInputChange}
              className="additional-info-input"
              readOnly
            />
          </div>

          <div className="input-group">
            <label>상세주소</label>
            <input
              type="text"
              name="memAddress2"
              placeholder="상세주소를 입력하세요"
              value={formData.memAddress2}
              onChange={handleInputChange}
              className="additional-info-input"
            />
          </div>

          <button 
            type="submit" 
            className="additional-info-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? '처리 중...' : '완료'}
          </button>
        </form>
      </div>
      
      {showSkinProfilePopup && (
        <SkinProfilePopup
          onClose={() => setShowSkinProfilePopup(false)}
          onLater={() => navigate('/')}
        />
      )}
    </div>
  );
};

export default KakaoAdditionalInfo;

