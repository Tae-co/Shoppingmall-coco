import React, { useState } from 'react';
import '../css/NoticePage.css';

// 공지사항 정적 데이터
const NOTICE_DATA = [
  {
    id: 1,
    title: '[공지] 쇼핑몰 오픈 기념 포인트 지급 이벤트 안내',
    date: '2025-11-01',
    content: `안녕하세요, Coco입니다.\n\nCoco 쇼핑몰 오픈을 기념하여 신규 가입 회원님들께 2,000 포인트를 즉시 지급해 드립니다.\n많은 이용 부탁드립니다.\n\n기간: 2025.11.01 ~ 별도 공지 시까지`
  },
  {
    id: 2,
    title: '[배송] 성탄절 연휴 배송 마감 및 지연 안내',
    date: '2025-12-01',
    content: `안녕하세요, Coco입니다.\n\n성탄절 연휴 및 연말 물량 증가로 인한 배송 일정을 안내해 드립니다.\n\n- 배송 마감: 12월 23일(화) 오후 2시 결제 건까지 당일 발송\n- 배송 재개: 12월 26일(금)부터 순차 발송\n\n연말 택배사 물량 증가로 평소보다 배송이 1~2일 지연될 수 있으니,\n급하신 상품은 여유 있게 주문해 주시길 바랍니다.\n\n따뜻하고 행복한 성탄절 보내세요!`
  },
  {
    id: 3,
    title: '[안내] 시스템 점검 안내 (12/05 02:00 ~ 04:00)',
    date: '2025-11-30',
    content: `더 나은 서비스 제공을 위해 서버 점검이 진행될 예정입니다.\n점검 시간에는 서비스 이용이 제한되오니 양해 부탁드립니다.\n\n일시: 2025년 12월 5일 새벽 2시 ~ 4시 (2시간)`
  },
  {
    id: 4,
    title: '[이벤트] 베스트 리뷰어 선정 혜택 안내',
    date: '2025-11-20',
    content: `매월 정성스러운 포토 리뷰를 남겨주신 3분을 선정하여 5,000 포인트를 드립니다!\n\n발표일: 매월 첫째 주 월요일 (공지사항 게시판)`
  }
];

function NoticePage() {
  // 어떤 게시글이 열려있는지 관리 (null이면 모두 닫힘)
  const [openId, setOpenId] = useState(null);

  const toggleNotice = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="notice-container">
      <div className="notice-header">
        <h1>공지사항</h1>
        <p>Coco의 새로운 소식과 안내를 확인하세요.</p>
      </div>

      <div className="notice-list">
        {/* 헤더 */}
        <div className="notice-list-header">
          <span className="col-id">No</span>
          <span className="col-title">제목</span>
          <span className="col-date">작성일</span>
        </div>

        {/* 리스트 아이템 */}
        {NOTICE_DATA.sort((a, b) => b.id - a.id).map((notice) => (
          <div key={notice.id} className={`notice-item ${openId === notice.id ? 'active' : ''}`}>

            {/* 제목 줄 (클릭 영역) */}
            <div
              className="notice-summary"
              onClick={() => toggleNotice(notice.id)}
              // 접근성 오류 해결을 위한 속성
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  toggleNotice(notice.id);
                }
              }}
            >
              <span className="col-id">{notice.id}</span>
              <span className="col-title">{notice.title}</span>
              <span className="col-date">{notice.date}</span>

              {/* SVG 꺽쇠 아이콘 */}
              <div className="arrow-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* 아래쪽을 가리키는 꺽쇠 모양 */}
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            {/* 내용 영역 (토글) */}
            {openId === notice.id && (
              <div className="notice-content">
                <p>{notice.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NoticePage;