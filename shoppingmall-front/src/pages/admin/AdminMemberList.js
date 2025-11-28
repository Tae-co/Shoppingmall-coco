import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Pagination from '../../components/admin/Pagination';
import Spinner from '../../components/admin/Spinner';
import { fetchWithAuth, getAuthHeaders } from '../../utils/api';
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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // 대시보드 상태
  const [dashboardStats, setDashboardStats] = useState({
    totalMembers: 0,
    adminCount: 0,
    userCount: 0
  });

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
        setMembers(data.members || []);
        setTotalPages(data.totalPages || 0);
        setDashboardStats(data.stats || {
          totalMembers: 0,
          adminCount: 0,
          userCount: 0
        });
      } else {
        throw new Error(data.message || '회원 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error("회원 목록 로드 실패:", error);
      toast.error(error.message || "회원 목록을 불러오는 데 실패했습니다.");
    }
    setIsLoading(false);
  }, [currentPage, searchTerm, selectedRole]);

  // useEffect에서는 loadMembers만 호출
  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // 포인트 수정 핸들러
  const handleUpdatePoint = async (memNo, currentPoint, memName) => {
    const newPointStr = window.prompt(`'${memName}' 회원의 포인트를 수정합니다.\n(현재: ${currentPoint})`, currentPoint);
    
    if (newPointStr === null) return; // 취소
    
    const newPoint = Number(newPointStr);
    if (isNaN(newPoint) || newPoint < 0) {
        alert("올바른 숫자를 입력해주세요.");
        return;
    }

    try {
        const response = await axios.put(`http://localhost:8080/api/member/admin/${memNo}/point`, 
            { point: newPoint }, 
            { headers: getAuthHeaders() }
        );

        if(response.status === 200) {
            toast.success("포인트가 수정되었습니다.");
            loadMembers(); // 목록 새로고침
        }
    } catch (error) {
        console.error(error);
        toast.error("포인트 수정 실패");
    }
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
          <p className="dash-title">일반 회원</p>
          <p className="dash-value">{dashboardStats.userCount}명</p>
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
                <th style={{width: '80px'}}>권한</th>
                <th style={{width: '80px'}}>포인트</th>
                <th style={{width: '80px'}}>가입일</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="9" className="loading-cell"><Spinner /></td></tr>
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
                              backgroundColor: member.role === 'ADMIN' ? '#dc3545' : '#28a745',
                              fontSize: '11px'
                              }}>
                        {member.role === 'ADMIN' ? '관리자' : '일반'}
                      </span>
                    </td>

                    {/* 포인트 수정 영역 */}
                    <td style={{whiteSpace: 'nowrap'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'}}>
                            <span>{member.point?.toLocaleString()} P</span>
                            <button 
                                className="icon-btn edit" 
                                onClick={() => handleUpdatePoint(member.memNo, member.point, member.memName)}
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
                <tr><td colSpan="9" className="empty-cell">검색 결과가 없습니다.</td></tr>
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
    </div>
  );
}

export default AdminMemberList;

