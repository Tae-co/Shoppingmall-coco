import React, { useState } from 'react';
import '../css/EventPage.css';

import welcomeImg from '../images/event/event_welcome.png'; // 신규가입 이미지
import holidayImg from '../images/event/event_holiday.png'; // 홀리데이 이미지
import reviewImg from '../images/event/event_review.png'; // 리뷰 이미지
import luckyboxImg from '../images/event/event_luckybox.png'; // 럭키박스 이미지

// 이벤트 데이터
const EVENT_DATA = [
  {
    id: 1,
    title: '신규 회원가입 2,000P 즉시 지급!',
    period: '2025.11.01 ~ 별도 공지 시',
    status: 'ing', // ing: 진행중, end: 종료
    image: welcomeImg,
    color: '#FFD700'
  },
  {
    id: 2,
    title: '설레는 연말, 12월 홀리데이 에디션 & 무료배송',
    period: '2025.12.01 ~ 2025.12.19',
    status: 'ing',
    image: holidayImg,
    color: '#FF6B6B'
  },
  {
    id: 3,
    title: '베스트 리뷰어 도전하고 적립금 받자',
    period: '매월 1일 ~ 말일',
    status: 'ing',
    image: reviewImg,
    color: '#4ECDC4'
  },
  {
    id: 4,
    title: '[종료] 오픈 기념 럭키박스 이벤트',
    period: '2025.11.01 ~ 2025.11.31',
    status: 'end',
    image: luckyboxImg,
    color: '#ccc'
  }
];

function EventPage() {
  const [filter, setFilter] = useState('all'); // all, ing, end

  // 필터링 로직
  const filteredEvents = EVENT_DATA.filter(event => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  return (
    <div className="event-container">
      <div className="event-header">
        <h1>EVENT</h1>
        <p>Coco만의 특별한 혜택을 만나보세요.</p>
      </div>

      {/* 필터 탭 */}
      <div className="event-tabs">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>전체</button>
        <button className={filter === 'ing' ? 'active' : ''} onClick={() => setFilter('ing')}>진행중인 이벤트</button>
        <button className={filter === 'end' ? 'active' : ''} onClick={() => setFilter('end')}>종료된 이벤트</button>
      </div>

      {/* 이벤트 리스트 (그리드) */}
      <div className="event-list">
        {filteredEvents.map((event) => (
          <div key={event.id} className="event-card">
            {/* 이미지가 있으면 배경이미지로, 없으면 배경색으로 처리 */}
            <div 
              className="event-thumbnail" 
              style={{ 
                backgroundImage: event.image ? `url(${event.image})` : 'none',
                backgroundColor: event.image ? 'transparent' : event.color
              }}
            >
              <span className={`status-badge ${event.status}`}>
                {event.status === 'ing' ? '진행중' : '종료'}
              </span>
            </div>
            
            <div className="event-info">
              <h3 className="event-title">{event.title}</h3>
              <p className="event-period">{event.period}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventPage;