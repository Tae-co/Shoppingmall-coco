import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Pagination from '../../components/admin/Pagination';
import Spinner from '../../components/admin/Spinner';
import PointUpdateModal from '../../components/admin/PointUpdateModal';
import { fetchWithAuth } from '../../utils/api';
import '../../css/admin/AdminProductList.css'; 
import '../../css/admin/AdminComponents.css';
import editIcon from '../../images/edit.svg';

const LIMIT = 10;

function AdminMemberList() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 검색 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedLoginType, setSelectedLoginType] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // 대시보드 상태
  const [dashboardStats, setDashboardStats] = useState({
    totalMembers: 0,
    adminCount: 0,
    userCount: 0,
    normalCount: 0,
    socialCount: 0,
    kakaoCount: 0,
    naverCount: 0,
    googleCount: 0
  });

  // 포인트 수정 모달 상태
  const [selectedMember, setSelectedMember] = useState(null); // 모달에 넘겨줄 멤버 객체
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: LIMIT.toString(),
      });

      if (searchTerm) {
        params.append('searchTerm', searchTerm);
      }
      if (selectedRole && selectedRole !== 'ALL') {
        params.append('role', selectedRole);
      }

      const response = await fetchWithAuth(`/member/admin/list?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        let filteredMembers = data.members || [];
        
        // 로그인 타입 필터링 (프론트엔드에서)
        if (selectedLoginType && selectedLoginType !== 'ALL') {
          filteredMembers = filteredMembers.filter(member => 
            member.loginType === selectedLoginType
          );
        }
        
        setMembers(filteredMembers);
        setTotalPages(data.totalPages || 0);
        setDashboardStats(data.stats || {
          totalMembers: 0,
          adminCount: 0,
          userCount: 0,
          normalCount: 0,
          socialCount: 0,
          kakaoCount: 0,
          naverCount: 0,
          googleCount: 0
        });
      } else {
        throw new Error(data.message || '회원 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error("회원 목록 로드 실패:", error);
      toast.error(error.message || "회원 목록을 불러오는 데 실패했습니다.");
    }
    setIsLoading(false);
  }, [currentPage, searchTerm, selectedRole, selectedLoginType]);

  // useEffect에서는 loadMembers만 호출
  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // 모달 열기
  const handleOpenModal = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  // 모달에서 수정 성공 시 호출될 콜백
  const handleUpdateSuccess = () => {
    loadMembers(); // 목록 새로고침
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="admin-page-container">
      <h2 className="page-title">회원 관리</h2>
      {/* --- 대시보드 --- */}
      <div className="dashboard-container">
          <div className="dash-card">
            <p className="dash-title">전체 회원</p>
            <p className="dash-value">{dashboardStats.totalMembers}명</p>
          </div>
        <div className="dash-card">
          <p className="dash-title">일반 로그인</p>
          <p className="dash-value">{dashboardStats.normalCount}명</p>
        </div>
        <div className="dash-card">
          <p className="dash-title">소셜 로그인</p>
          <p className="dash-value">{dashboardStats.socialCount}명</p>
        </div>
        <div className="dash-card">
          <p className="dash-title">관리자</p>
          <p className="dash-value">{dashboardStats.adminCount}명</p>
        </div>
        <div className="dash-card">
          <p className="dash-title">현재 페이지</p>
          <p className="dash-value">{currentPage} / {totalPages || 1}</p>
        </div>
      </div>

      {/* --- 회원 목록 --- */}
      <div className="admin-content-card">
        <div className="content-header">
          <h3>회원 목록</h3>
          <button className="btn-refresh" onClick={loadMembers}>🔄 새로고침</button>
        </div>

        {/* 검색 / 필터 */}
        <div className="filter-container">
          <select 
            className="filter-select"
            value={selectedRole}
            onChange={(e) => { setSelectedRole(e.target.value); setCurrentPage(1); }}
          >
            <option value="ALL">전체 권한</option>
            <option value="USER">일반 회원</option>
            <option value="ADMIN">관리자</option>
          </select>

          <select 
            className="filter-select"
            value={selectedLoginType}
            onChange={(e) => { setSelectedLoginType(e.target.value); setCurrentPage(1); }}
          >
            <option value="ALL">전체 로그인 타입</option>
            <option value="일반">일반 로그인</option>
            <option value="카카오">카카오</option>
            <option value="네이버">네이버</option>
            <option value="구글">구글</option>
          </select>

          <input
            type="text"
            className="search-input"
            placeholder="아이디, 닉네임, 이름, 이메일 검색..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {/* --- 회원 테이블 --- */}
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{width: '50px'}}>No</th>
                <th style={{width: '60px'}}>아이디</th>
                <th style={{width: '90px'}}>닉네임</th>
                <th style={{width: '80px'}}>이름</th>
                <th style={{width: '80px'}}>이메일</th>
                <th style={{width: '100px'}}>전화번호</th>
                <th style={{width: '80px'}}>로그인 타입</th>
                <th style={{width: '80px'}}>권한</th>
                <th style={{width: '80px'}}>포인트</th>
                <th style={{width: '80px'}}>가입일</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="10" className="loading-cell"><Spinner /></td></tr>
              ) : members.length > 0 ? (
                members.map((member) => (
                  <tr key={member.memNo}>
                    <td>{member.memNo}</td>
                    <td style={{maxWidth: '150px'}}> {/* 부모 td에 최대 너비 제한 */}
                        <div 
                            className="fw-bold" 
                            title={member.memId} // 마우스 오버 시 툴팁으로 전체 내용 표시
                            style={{
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                cursor: 'help' // 마우스 커서 변경
                            }}
                        >
                            {member.memId}
                        </div>
                    </td>
                    <td>{member.memNickname}</td>
                    <td>{member.memName}</td>
                    <td style={{maxWidth: '200px'}}>
                        <div 
                            title={member.memMail}
                            style={{
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                cursor: 'help' // 마우스 커서 변경
                            }}
                        >
                            {member.memMail}
                        </div>
                    </td>
                    <td>{member.memHp}</td>
                    <td>
                      <span className={`status-tag`} 
                            style={{
                              backgroundColor: 
                                member.loginType === '카카오' ? '#FEE500' :
                                member.loginType === '네이버' ? '#03C75A' :
                                member.loginType === '구글' ? '#4285F4' :
                                '#6c757d',
                              color: member.loginType === '카카오' ? '#000' : '#fff',
                              fontSize: '11px'
                              }}>
                        {member.loginType || '일반'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-tag`} 
                            style={{
                              backgroundColor: member.role === 'ADMIN' ? '#dc3545' : '#28a745',
                              fontSize: '11px'
                              }}>
                        {member.role === 'ADMIN' ? '관리자' : '일반'}
                      </span>
                    </td>

                    {/* 버튼 클릭 시 분리된 모달 열기 핸들러 호출 */}
                    <td style={{whiteSpace: 'nowrap'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'}}>
                            <span>{member.point?.toLocaleString()} P</span>
                            <button 
                                className="icon-btn edit" 
                                onClick={() => handleOpenModal(member)} 
                                title="포인트 수정"
                            >
                                <img src={editIcon} alt="수정" />
                            </button>
                        </div>
                    </td>

                    <td>{formatDate(member.memJoindate)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="10" className="empty-cell">검색 결과가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    
    {/* 분리된 모달 컴포넌트 사용 */}
      <PointUpdateModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        member={selectedMember}
        onSuccess={handleUpdateSuccess}
      />

    </div>
  );
}

export default AdminMemberList;

