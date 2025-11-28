import React from 'react';
import { Link } from 'react-router-dom';
import '../../css/error/NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1 className="not-found-code">404</h1>
      <h2 className="not-found-title">페이지를 찾을 수 없습니다</h2>
      <p className="not-found-desc">
        방문하시려는 페이지의 주소가 잘못 입력되었거나,<br />
        페이지의 주소가 변경 혹은 삭제되어 요청하신 페이지를 찾을 수 없습니다.
      </p>
      <Link to="/" className="home-btn">
        홈으로 돌아가기
      </Link>
    </div>
  );
};

export default NotFound;