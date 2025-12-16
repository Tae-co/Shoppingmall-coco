import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/KakaoAdditionalInfo.css';
import { 
  updateMember, 
  isLoggedIn, 
  storage, 
  STORAGE_KEYS, 
  checkSkinProfile, 
  getStoredMember,
  checkNicknameDuplicate
} from '../utils/api';
import SkinProfilePopup from '../components/SkinProfilePopup';

const KakaoAdditionalInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    memName: '',
    memNickname: '',
    memHp: '',
    memZipcode: '',
    memAddress1: '',
    memAddress2: ''
  });
  
  // 페이지 로드 시 저장된 회원 정보에서 기존 정보 가져오기 (닉네임은 가져오지 않음)
  useEffect(() => {
    const member = getStoredMember();
    if (member) {
      setFormData(prev => ({
        ...prev,
        memName: member.memName || '',
        memHp: member.memHp || '',
        memZipcode: member.memZipcode || '',
        memAddress1: member.memAddress1 || '',
        memAddress2: member.memAddress2 || ''
      }));
    }
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkinProfilePopup, setShowSkinProfilePopup] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);

  // 입력 필드 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 닉네임이 변경되면 중복확인 상태 초기화
    if (name === 'memNickname') {
      setIsNicknameChecked(false);
    }
  };

  // 닉네임 중복 확인 처리
  const handleCheckNickname = async () => {
    if (!formData.memNickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    if (formData.memNickname.length < 2) {
      alert('닉네임은 2자 이상 입력해주세요.');
      return;
    }
    
    try {
      const data = await checkNicknameDuplicate(formData.memNickname);
      
      if (data.available) {
        setIsNicknameChecked(true);
        alert('사용 가능한 닉네임입니다.');
      } else {
        alert(data.message || '이미 사용 중인 닉네임입니다.');
        setIsNicknameChecked(false);
      }
    } catch (error) {
      console.error('닉네임 중복확인 오류:', error);
      alert(error.message || '중복확인 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsNicknameChecked(false);
    }
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
    
    if (!formData.memName.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!formData.memNickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    if (!isNicknameChecked) {
      alert('닉네임 중복확인을 해주세요.');
      return;
    }
    if (!formData.memHp.trim()) {
      alert('전화번호를 입력해주세요.');
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
            <label>이름 *</label>
            <input
              type="text"
              name="memName"
              placeholder="이름을 입력하세요"
              value={formData.memName}
              onChange={handleInputChange}
              className="additional-info-input"
              required
            />
          </div>

          <div className="input-group">
            <label>닉네임 *</label>
            <div className="input-with-button">
              <input
                type="text"
                name="memNickname"
                placeholder="2자 이상 입력"
                value={formData.memNickname}
                onChange={handleInputChange}
                className="additional-info-input"
                required
              />
              <button
                type="button"
                className="check-button"
                onClick={handleCheckNickname}
              >
                중복확인
              </button>
            </div>
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

