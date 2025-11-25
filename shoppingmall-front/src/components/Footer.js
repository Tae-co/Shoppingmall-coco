import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../images/logo.png';
import '../css/Footer.css';

const Footer = () => {
    const navigate = useNavigate(); // 훅 선언

    // 카테고리 이동 핸들러
    const handleCategoryClick = (categoryNo) => {
        navigate(`/product?categoryNo=${categoryNo}`);
        window.scrollTo(0, 0);
    };

    return (
        <div>
            <div className="footer">
                <div className="footer_top">
                    <div className="service_area">
                        <div className="footer_menu">
                            <div className="logo_box">
                                <img src={Logo} alt="logo.png" className="footer_logo"/>
                                <div className="footer_logo_content">리뷰로 시작하는 스마트한 뷰티 쇼핑</div>
                            </div>
                            <div className="menu_box">
                                <strong className="menu_title">쇼핑</strong>
                                <ul className="menu_list">
                                    <li className="menu_item" onClick={() => handleCategoryClick(1)}>
                                        <div>스킨케어</div>
                                    </li>
                                    <li className="menu_item" onClick={() => handleCategoryClick(2)}>
                                        <div>메이크업</div>
                                    </li>
                                    {/* 홈에 맞춰 클렌징' -> 바디/헤어로 변경 */}
                                    <li className="menu_item" onClick={() => handleCategoryClick(3)}>
                                        <div>바디/헤어</div>
                                    </li>
                                    {/* 홈에 맞춰 마스크팩 -> 옴므로 변경 */}
                                    <li className="menu_item" onClick={() => handleCategoryClick(4)}>
                                        <div>옴므</div>
                                    </li>
                                </ul>
                            </div>
                            <div className="menu_box">
                                <strong className="menu_title">고객지원</strong>
                                <ul className="menu_list">
                                    <li className="menu_item"><div>공지사항</div></li>
                                    <li className="menu_item"><div>이용약관</div></li>
                                    <li className="menu_item"><div>개인정보처리방침</div></li>
                                    <li className="menu_item"><div>배송/반품/교환 안내</div></li>
                                </ul>
                            </div>
                        </div> 
                        <div className="customer_service">
                            <strong className="service_title">고객센터</strong>
                            <div className="service_time">
                                운영시간 평일 10:00 - 18:00 (토∙일, 공휴일 휴무) <br/>
                                점심시간 평일 13:00 - 14:00
                            </div>
                            <div className="service_note">1:1 문의하기는 앱에서만 가능합니다.</div>
                            <div className="btn_service_box">
                                <div className="btn_faq">자주 묻는 질문</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer_bottom">
                    <div className="copyright">
                        Copyright ⓒ COCO Beauty. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Footer;