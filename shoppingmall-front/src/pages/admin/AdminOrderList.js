import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Pagination from '../../components/admin/Pagination';
import Spinner from '../../components/admin/Spinner';
import '../../css/admin/AdminProductList.css';
import '../../css/admin/AdminComponents.css';

function AdminOrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null); // 모달용 선택된 주문

  // 검색 필터 상태
  const [searchStatus, setSearchStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 한글 변환을 위한 매핑 객체 생성
  const statusMap = {
    PENDING: "결제대기",
    PAID: "결제완료",
    PREPARING: "상품준비중",
    SHIPPING: "배송중",
    DELIVERED: "배송완료",
    CANCELLED: "주문취소",
  };

  // 상태별 텍스트 색상 반환 함수
  const getStatusColor = (status) => {
    switch (status) {
      case 'CANCELLED':
        return '#dc3545'; // 빨강 (취소)
      case 'DELIVERED':
        return '#28a745'; // 초록 (완료)
      case 'PAID':
        return '#007bff'; // 파랑 (결제완료 -> 관리자 작업 시작)
      case 'PREPARING':
      case 'SHIPPING':
        return '#fd7e14'; // 주황 (진행중)
      case 'PENDING':
        return '#6c757d'; // 회색 (대기)
      default:
        return '#333';    // 기본 검정
    }
  };

  // 주문 상태 옵션
  const statusOptions = Object.keys(statusMap);

  const fetchOrders = useCallback(async (resetPage = false) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {
        page: resetPage ? 1 : currentPage,
        size: 10,
        status: searchStatus || null,     // 필터 없으면 null
        searchTerm: searchTerm || null    // 검색어 없으면 null
      };
      const response = await axios.get(`http://13.231.28.89:18080/api/admin/orders?page=${currentPage}&size=10`, {
        headers: { Authorization: `Bearer ${token}` },
        params: params
      });

      setOrders(response.data.content);
      setTotalPages(response.data.totalPages);
      if (resetPage) setCurrentPage(1);

    } catch (error) {
      console.error(error);
      toast.error("주문 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchStatus, searchTerm]);

  // useEffect 의존성에 fetchOrders 추가
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 검색 버튼 핸들러
  const handleSearch = () => {
    fetchOrders(true); // 검색 시 1페이지로 초기화
  };

  // 엔터키 검색 지원
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleStatusChange = async (orderNo, newStatus) => {
    if (!window.confirm(`주문상태를 '${statusMap[newStatus]}'(으)로 변경하시겠습니까?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://13.231.28.89:18080/api/admin/orders/${orderNo}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("상태가 변경되었습니다.");

      // 목록 전체를 다시 불러오지 않고, UI만 업데이트
      setOrders(prev => prev.map(order =>
        order.orderNo === orderNo ? { ...order, status: newStatus } : order
      ));

    } catch (error) {
      toast.error("상태 변경 실패");
    }
  };

  // 모달 열기
  const openModal = (order) => {
    setSelectedOrder(order);
  };

  // 모달 닫기
  const closeModal = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="admin-page-container">
      <h2 className="page-title">주문 관리</h2>

      <div className="admin-content-card">
        <div className="content-header">
          <h3>전체 주문 목록</h3>
          <div className="header-actions">
            <button className="btn-refresh" onClick={() => fetchOrders(false)}>🔄 새로고침</button>
          </div>
        </div>

        {/* 검색 및 필터 영역 */}
        <div className="filter-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <select
            className="filter-select"
            value={searchStatus}
            onChange={(e) => setSearchStatus(e.target.value)}
          >
            <option value="">전체 상태</option>
            {statusOptions.map(key => (
              <option key={key} value={key}>{statusMap[key]}</option>
            ))}
          </select>

          <input
            type="text"
            className="search-input"
            placeholder="주문번호 또는 주문자명 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button
            className="btn-search"
            onClick={handleSearch}
          >
            검색
          </button>
        </div>

        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>주문일자</th>
                <th>주문자</th>
                <th>상품명</th>
                <th>결제금액</th>
                <th>상태관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="loading-cell"><Spinner /></td></tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.orderNo}>
                    <td onClick={() => openModal(order)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                      {order.orderNo}
                    </td>
                    <td>{order.orderDate}</td>
                    <td>{order.recipientName}</td>
                    <td>
                      {order.items && order.items.length > 0
                        ? `${order.items[0].productName} ${order.items.length > 1 ? `외 ${order.items.length - 1}건` : ''}`
                        : '-'}
                    </td>
                    <td>{order.totalPrice.toLocaleString()}원</td>
                    <td>
                      <select
                        className="status-select"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.orderNo, e.target.value)}
                        style={{
                          padding: '6px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          fontWeight: 'bold',
                          color: getStatusColor(order.status)
                        }}
                      >
                        {statusOptions.map(key => (
                          <option key={key} value={key}>
                            {statusMap[key]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="empty-cell">주문 내역이 없습니다.</td></tr>
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

      {/* --- 주문 상세 모달 --- */}
      {selectedOrder && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          // 배경: 버튼 역할 명시 및 키보드로 닫기 기능 추가
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              closeModal();
            }
          }}
          aria-label="모달 닫기"
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            // 내용: 키보드 이벤트 전파 방지
            onKeyDown={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            <div className="modal-header">
              <h3>주문 상세 정보 (No. {selectedOrder.orderNo})</h3>
              <button className="btn-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="info-group">
                <h4>📦 배송지 정보</h4>
                <p><strong>수령인:</strong> {selectedOrder.recipientName}</p>
                <p><strong>연락처:</strong> {selectedOrder.recipientPhone}</p>
                <p><strong>주소:</strong> [{selectedOrder.orderZipcode}] {selectedOrder.orderAddress1} {selectedOrder.orderAddress2}</p>
                <p><strong>배송메시지:</strong> {selectedOrder.deliveryMessage || '-'}</p>
              </div>

              <div className="info-group">
                <h4>🛒 주문 상품 목록</h4>
                <table className="modal-table">
                  <thead>
                    <tr>
                      <th>상품명</th>
                      <th>옵션</th>
                      <th>수량</th>
                      <th>금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.productName}</td>
                        <td>{item.optionName || '기본'}</td>
                        <td>{item.qty}개</td>
                        <td>{item.price.toLocaleString()}원</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>닫기</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminOrderList;