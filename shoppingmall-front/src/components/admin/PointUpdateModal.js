import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAuthHeaders } from '../../utils/api'; // 경로는 프로젝트 구조에 맞게 조정하세요

const PointUpdateModal = ({ isOpen, onClose, member, onSuccess }) => {
  const [newPointInput, setNewPointInput] = useState('');

  // 모달이 열릴 때마다 초기값 설정
  useEffect(() => {
    if (isOpen && member) {
      setNewPointInput(member.point || 0);
    }
  }, [isOpen, member]);

  if (!isOpen || !member) return null;

  const savePoint = async () => {
    const newPoint = Number(newPointInput);

    if (isNaN(newPoint) || newPoint < 0) {
      alert("올바른 숫자(0 이상)를 입력해주세요.");
      return;
    }

    try {
      const response = await axios.put(
        `http://13.231.28.89:18080/api/member/admin/${member.memNo}/point`,
        { point: newPoint },
        { headers: getAuthHeaders() }
      );

      if (response.status === 200) {
        toast.success("포인트가 수정되었습니다.");
        onSuccess(); // 부모 컴포넌트의 목록 새로고침 함수 호출
        onClose();   // 모달 닫기
      }
    } catch (error) {
      console.error(error);
      toast.error("포인트 수정 실패");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '380px',
          width: '90%',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}
      >
        {/* 헤더 */}
        <div className="modal-header" style={{ borderBottom: '1px solid #eee', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>포인트 수정</h3>
          <button
            className="btn-close"
            onClick={onClose}
            style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}
          >
            ×
          </button>
        </div>

        {/* 본문 */}
        <div className="modal-body" style={{ padding: '30px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', marginBottom: '25px', color: '#555' }}>
            <strong>{member.memName}</strong> 님의 포인트
          </p>

          <div style={{ marginBottom: '20px', background: '#f8f9fa', padding: '12px', borderRadius: '8px' }}>
            <span style={{ color: '#666', fontSize: '14px' }}>현재: </span>
            <span style={{ fontWeight: 'bold', color: '#333', fontSize: '18px', marginLeft: '5px' }}>
              {member.point?.toLocaleString()} P
            </span>
          </div>

          {/* 입력창 영역 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
            <input
              type="number"
              value={newPointInput}
              onChange={(e) => setNewPointInput(e.target.value)}
              placeholder="0"
              style={{
                padding: '12px',
                width: '160px',
                fontSize: '18px',
                textAlign: 'right',
                border: '1px solid #ddd',
                borderRight: 'none',
                borderRadius: '6px 0 0 6px',
                outline: 'none',
                color: '#333',
                fontWeight: '600'
              }}
            />
            {/* 단위 표시 (P) */}
            <span style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#555',
              background: '#fff',
              border: '1px solid #ddd',
              borderLeft: 'none',
              padding: '12px 15px 12px 5px',
              borderRadius: '0 6px 6px 0',
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              boxSizing: 'border-box'
            }}>
              P
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            * 변경할 최종 포인트 금액을 입력하세요.
          </p>
        </div>

        {/* 푸터 (버튼 영역) */}
        <div className="modal-footer" style={{
          borderTop: '1px solid #eee',
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          background: '#fafafa'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              border: '1px solid #ddd',
              background: 'white',
              color: '#666',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#f1f1f1'}
            onMouseOut={(e) => e.target.style.background = 'white'}
          >
            취소
          </button>
          <button
            onClick={savePoint}
            style={{
              backgroundColor: '#333',
              color: 'white',
              border: '1px solid #333',
              padding: '10px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#555';
              e.target.style.borderColor = '#555';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#333';
              e.target.style.borderColor = '#333';
            }}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointUpdateModal;