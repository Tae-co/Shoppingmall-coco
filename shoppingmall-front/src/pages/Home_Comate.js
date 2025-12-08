import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../css/Home_Comate.css';

import ComateMiniProfile from "../components/ComateMiniProfile";
import { getCurrentMember } from '../utils/api'; 
import { getRandomComates, follow, unfollow } from "../utils/comate_api"; 

function Home_Comate() {
    const navigate = useNavigate();

    const settings = {
        accessibility: false,
        className: "center",
        centerMode: true,
        infinite: true,
        centerPadding: "60px",
        slidesToShow: 5,
        slideToScroll: 1,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
        focusOnSelect: true,
        // 반응형 설정
        responsive: [
            {
                breakpoint: 1280, // 큰 화면 ↓ (보통 4개가 안정적)
                settings: {
                    slidesToShow: 4,
                    centerPadding: "35px",
                },
            },
            {
                breakpoint: 1024, // 보통 노트북 ↓
                settings: {
                    slidesToShow: 3,
                    centerPadding: "30px",
                },
            },
            {
                breakpoint: 768, // 태블릿 ↓
                settings: {
                    slidesToShow: 2,
                    centerPadding: "25px",
                },
            },
            {
                breakpoint: 480, // 모바일 ↓
                settings: {
                    slidesToShow: 1,
                    centerMode: true,
                    centerPadding: "20px",
                },
            },
        ]
    };

    // 전체 회원 목록
    const [comates, setComates] = useState([]);
    const [loading, setLoading] = useState(true);

    // 로그인 여부
    const [loginUser, setLoginUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 팔로우 상태 관리 (memNo 기준)
    const [followStatus, setFollowStatus] = useState({});

    // 로그인 정보 가져오기
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await getCurrentMember();
                setLoginUser(user);
                setIsLoggedIn(true);
            } catch (error) {
                console.error('로그인 유저 정보 없음 (비로그인 상태/토큰 만료) ', error);
                setLoginUser(null);
                setIsLoggedIn(false);
            }
        };

        fetchUser();
    }, []);

    // 회원 전체 목록 가져오기
    useEffect(() => {
        const loadComates = async () => {
            try {
                const data = await getRandomComates();
                setComates(data);
                // 팔로우 상태 초기화
                const status = {};
                data.forEach(c => {
                    status[c.memNo] = !!c.following;
                });
                setFollowStatus(status);

            } catch (error) {
                console.error(error);
                alert("회원 정보를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };
        
        loadComates();
    }, []);

    // 프로필 클릭-> 상세 프로필 이동
    const handleCardClick = (memNo) => {
        navigate(`/comate/user/${memNo}/review`);
    };

    // 팔로우 버튼 클릭
    const handleFollowClick = async (comate) => {
        if (!isLoggedIn) {
            alert("로그인이 필요한 서비스입니다.");
            navigate("/login");
            return;
        }

        try {
            const isFollowing = followStatus[comate.memNo] || false;

            if (isFollowing) {
                await unfollow(comate.memNo);
            } else {
                await follow(comate.memNo);
            }

            // 팔로우 상태 업데이트
            setFollowStatus(prev => ({
                ...prev,
                [comate.memNo]: !isFollowing
            }));

            // 팔로워 수 UI 업데이트
            setComates(prev => prev.map(c => 
                c.memNo === comate.memNo 
                ? {...c, followerCount: c.followerCount + (isFollowing ? -1 : 1)}
                : c
            ));

        } catch (error) {
            console.error(error);
            alert("팔로우/언팔로우 처리 중 오류가 발생했습니다.");
        }
    };

    if (loading) return <div>로딩중...</div>;

    return (
        <div className="comate-slider-container">
            <Slider {...settings}>
                {comates
                    .filter(c => loginUser ? c.memNo !== loginUser.memNo : true)
                    .map((comate) => (
                    <div key={comate.memNo}>
                        <ComateMiniProfile
                            nickname={comate.memNickname}
                            skinTags={comate.skinTags}
                            followers={comate.followerCount}
                            reviews={comate.reviewCount}
                            isFollowing={followStatus[comate.memNo] || false}
                            matchingRate={comate.matchingRate}
                            onClick={() => handleCardClick(comate.memNo)}
                            onFollowClick={() => handleFollowClick(comate)}
                        />
                    </div>
                ))}
            </Slider>
        </div>
    );
}

export default Home_Comate;
