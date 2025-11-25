import React, {useEffect, useState} from 'react';
import {NavLink, Link, Routes, Route, useNavigate, useLocation} from 'react-router-dom';

import Logo from '../images/logo.png';

import '../css/Header.css';
import { getStoredMember, isLoggedIn, logout, getCurrentMember } from '../utils/api';
import axios from "axios";


const Header = () => {

    const navigate = useNavigate();

    // 초기 상태를 localStorage에서 설정
    const getInitialState = () => {
        const status = isLoggedIn();
        if (status) {
            const memberData = getStoredMember();
            if (memberData && Object.keys(memberData).length > 0) {
                const fallbackName = memberData.memNickname || memberData.nickname || memberData.memName || memberData.memId || '회원';
                return {
                    loggedIn: true,
                    userName: fallbackName,
                    userRole: memberData.role || ''
                };
            }
        }
        return {
            loggedIn: false,
            userName: '',
            userRole: ''
        };
    };

    const initialState = getInitialState();
    const [loggedIn, setLoggedIn] = useState(initialState.loggedIn);
    const [userName, setUserName] = useState(initialState.userName);
    const [userRole, setUserRole] = useState(initialState.userRole);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const syncLoginStatus = () => {
            const status = isLoggedIn();
            setLoggedIn(status);

            if (status) {
                // localStorage에서 회원 정보 가져오기 (로그인 시 이미 저장됨)
                const memberData = getStoredMember();
                if (memberData && Object.keys(memberData).length > 0) {
                    const fallbackName = memberData.memNickname || memberData.nickname || memberData.memName || memberData.memId || '회원';
                    setUserName(fallbackName);
                    setUserRole(memberData.role || '');
                } else {
                    setUserName('');
                    setUserRole('');
                }
            } else {
                setUserName('');
                setUserRole('');
            }
        };
    // 장바구니 개수 동기화 함수
    const syncCartCount = async () => {
        try {
            const member = getStoredMember();
            if (!member || !member.memNo) {
                setCartCount(0);
                return;
            }

            const res = await axios.get(
                `http://localhost:8080/api/coco/members/cart/items/${member.memNo}`
            );
            setCartCount(res.data.length);  // 장바구니 아이템 개수
        } catch (err) {
            console.error("장바구니 개수 조회 실패:", err);
        }
    };

        // 초기 로드 시 먼저 localStorage에서 상태 확인
        syncLoginStatus();
        syncCartCount();
        // 그 다음 백엔드에서 최신 정보 가져오기 (한 번만)
        const loadMemberInfo = async () => {
            if (isLoggedIn()) {
                try {
                    const memberData = await getCurrentMember();
                    const fallbackName = memberData.memNickname || memberData.nickname || memberData.memName || memberData.memId || '회원';
                    setUserName(fallbackName);
                    setUserRole(memberData.role || '');
                    setLoggedIn(true); // 백엔드 호출 성공 시 로그인 상태 확실히 설정
                } catch (error) {
                    // 백엔드 호출 실패 시 localStorage에서 가져오기
                    console.error('회원 정보 조회 실패:', error);
                    syncLoginStatus();
                }
            }
        };

        loadMemberInfo();
        
        // 로그인 상태 변경 이벤트 리스너 (로그인/로그아웃 시에만 발생)
        window.addEventListener('loginStatusChanged', syncLoginStatus);
        window.addEventListener("cartUpdated", syncCartCount);
        return () => {
            window.removeEventListener('loginStatusChanged', syncLoginStatus);
            window.removeEventListener("cartUpdated", syncCartCount);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // 마이페이지 클릭 핸들러 (관리자는 관리자 페이지로 이동)
    const handleMyPageClick = (e) => {
        e.preventDefault();
        if (userRole === 'ADMIN' || userRole === 'admin') {
            navigate('/admin');
        } else {
            navigate('/mypage');
        }
    };

    const location = useLocation(); // 현재 페이지 확인용

    // 검색어 상태 관리
    const [searchTerm, setSearchTerm] = useState(''); 
    
    // 디바운싱을 위한 타이머 상태
    const [timer, setTimer] = useState(null);

    // URL의 쿼리스트링(?q=...)이 바뀌면 입력창도 동기화 (새로고침 등 대응)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q');
        if (query) {
            setSearchTerm(query);
        } else if (location.pathname !== '/product') {
            // 상품 페이지가 아니면 검색창 비우기 (선택사항)
            setSearchTerm('');
        }
    }, [location.search, location.pathname]);

    // 입력창 변경 핸들러 (실시간 검색 로직)
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value); // 화면에는 바로 글자가 써지게 함

        // 현재 페이지가 '상품 목록' 페이지일 때만 실시간 검색 작동
        if (location.pathname === '/product') {
            // 이전에 설정된 타이머가 있다면 취소 (연속 입력 시 API 호출 방지)
            if (timer) {
                clearTimeout(timer);
            }

            // 0.5초 뒤에 검색 실행 (디바운스)
            const newTimer = setTimeout(() => {
                navigate(`/product?q=${encodeURIComponent(value)}`);
            }, 500);

            setTimer(newTimer);
        }
    };

    // 엔터키/버튼 클릭 핸들러 (기존 유지)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // 엔터를 쳤을 때는 타이머 취소하고 즉시 이동
        if (timer) clearTimeout(timer);
        
        if (searchTerm.trim() === "") {
            alert("검색어를 입력하세요");
            return;
        }
        navigate(`/product?q=${encodeURIComponent(searchTerm)}`);
    };


    // 검색 핸들러 함수
    const handleSearch = (e) => {
        e.preventDefault();
        const searchValue = e.target.search.value.trim(); // 공백 제거

        if (searchValue === "") {
            alert("검색어를 입력하세요");
            return;
        }

        // 상품 목록 페이지로 이동하며 쿼리 스트링 전달
        // 예: /product?q=립스틱
        navigate(`/product?q=${encodeURIComponent(searchValue)}`);
        
        // 검색 후 입력창 비우기
        e.target.search.value = '';
    };

    return (
        <div>
            <header className="header">
                {/* 헤더 상단 영역 */}
                <div className="header_top">
                    <div className="top_inner">
                        <ul className="top_list">
                            {/* 로그인 시 사용자 이름 표시 */}
                                {loggedIn && (
                                <li className="top_item greet">
                                    <b>{userName}</b>님 환영합니다!
                                </li>
                            )}
                            <li className="top_item">고객센터</li>
                            <li className="top_item">
                                <a href="#" className="top_item" onClick={handleMyPageClick}>
                                    {userRole === 'ADMIN' || userRole === 'admin' ? '관리자 페이지' : '마이페이지'}
                                </a>
                            </li>
                            <li className="top_item">알림</li>
                            <li className="top_item">
                                {/* 로그인 여부에 따라 로그인/로그아웃 버튼 분기 */}
                                {loggedIn ? (
                                    <button type="button" className="top_item logout_button" onClick={handleLogout}>
                                        로그아웃
                                    </button>
                                ) : (
                                    <Link to="/login" className="top_item">로그인</Link>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
                {/* 헤더 메인 영역 */}
                <div className="header_main">
                    <div className="main_inner">
                        {/* 로고 */}
                        <h1>
                            <NavLink to="/">
                                <img src={Logo} alt="logo.png" className="logo"/>
                            </NavLink>
                        </h1>
                        {/* 네비게이션 메뉴 */}
                        <div className="header_center">
                            <nav id="gnb_container" className="gnb">
                                <ul id="gnb_list" className="gnb_list">
                                    <li className="gnb_item"><NavLink 
                                                            to="/" 
                                                            className={({isActive}) => 
                                                                isActive ? 'gnb_link active' : 'gnb_link'}>HOME</NavLink></li>
                                    <li className="gnb_item"><NavLink 
                                                            to="/product" 
                                                            className={({isActive}) => 
                                                                isActive ? 'gnb_link active' : 'gnb_link'}>SHOP</NavLink></li>
                                    <li className="gnb_item"><NavLink 
                                                            to="/comate/me/review" 
                                                            className={({isActive}) => {
                                                                return window.location.pathname.startsWith('/comate') ? 'gnb_link active' : 'gnb_link'}}>CO-MATE</NavLink></li>
                                    <li className="gnb_item"><div className="gnb_link">EVENT</div></li>
                                </ul>
                            </nav>
                        </div>
                        {/* 우측 기능 버튼 */}
                        <div className="header_right">  
                            {/* 검색 폼 수정*/}
                            <div className="search_container">
                                <form onSubmit={handleSearch}>
                                    <input type="text" name="search" placeholder="검색어를 입력해보세요" value={searchTerm} onChange={handleInputChange} autoComplete="off" />
                                    <button type="submit" className="btn_search">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="" viewBox="0 0 24 24" width="20" height="20">
                                            <path fill="#777777" fillRule="evenodd" d="M15.571 16.631a8.275 8.275 0 1 1 1.06-1.06l4.5 4.498-1.061 1.06-4.499-4.498Zm1.478-6.357a6.775 6.775 0 1 1-13.55 0 6.775 6.775 0 0 1 13.55 0Z" clipRule="evenodd"></path>
                                        </svg>
                                    </button>
                                </form>
                            </div>
                            {/* 장바구니 버튼 */}
                            <Link to="/cart" className="btn_cart">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="#222" fillRule="evenodd" d="M16.192 5.2h3.267a1 1 0 0 1 .998.938l.916 14.837a.4.4 0 0 1-.399.425H3.025a.4.4 0 0 1-.4-.425l.917-14.837A1 1 0 0 1 4.54 5.2h3.267a4.251 4.251 0 0 1 8.385 0ZM7.75 6.7H5.01l-.815 13.2h15.61l-.816-13.2h-2.74v2.7h-1.5V6.7h-5.5v2.7h-1.5V6.7Zm1.59-1.5h5.32a2.751 2.751 0 0 0-5.32 0Z" clipRule="evenodd"></path>
                                </svg>
                                {cartCount > 0 && (<span className="cart-badge">{cartCount}</span>)}
                            </Link>
                            {/* 카테고리 버튼 */}
                            <a className="btn_category">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="#222" d="M3 5.61h18v1.8H3v-1.8ZM3 11.1h18v1.8H3v-1.8ZM21 16.595H3v1.8h18v-1.8Z"></path>
                                </svg>
                            </a>
                        </div> 
                    </div>
                </div>
            </header>
        </div>
    );
}

export default Header;