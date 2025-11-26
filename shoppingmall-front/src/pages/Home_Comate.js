import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../css/Home_Comate.css';

import ComateMiniProfile from "../components/ComateMiniProfile";
import { getAllComates } from "../utils/comate_api"; 

function Home_Comate() {
    const navigate = useNavigate();

    const settings = {
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
        focusOnSelect: true
    };

    // 전체 회원 목록
    const [comates, setComates] = useState([]);
    const [loading, setLoading] = useState(true);

    // 로그인 여부 (임시)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // 팔로우 상태 관리 (유저별)
    const [followStatus, setFollowStatus] = useState({});

    // 회원 전체 목록 가져오기
    useEffect(() => {
        const loadComates = async () => {
            try {
                const data = await getAllComates();
                setComates(data);
            } catch (error) {
                console.error(error);
                alert("회원 정보를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        }
        
        loadComates();
    }, []);

    // 프로필 클릭-> 상세 프로필 이동
    const handleCardClick = (memNo) => {
        navigate(`/comate/user/${memNo}/review`);
    };

    // 팔로우 버튼 클릭
    const handleFollowClick = (comateNickname) => {
        // 로그인 여부 확인
        if (!isLoggedIn) {
            alert("로그인이 필요한 서비스입니다.");
            navigate("/login");
            return;
        }
        console.log(`${comateNickname} 팔로우`);

        // 팔로우 상태 업데이트
        // 이미 팔로잉 하고 있다면 active 버튼으로 표시
        setFollowStatus((prev) => {
            const isFollowing = prev[comateNickname] || false;
            return {
                ...prev,
                [comateNickname]: !isFollowing,
            };
        });
    };

  return (
    <div className="comate-slider-container">
        <Slider {...settings}>
            {comates.map((comate) => {
                const isFollowing = followStatus[comate.nickname] || false;
                return (
                    <div key={comate.memNo}>
                        <ComateMiniProfile
                            nickname={comate.memNickname}
                            // skinTypes={comate.skinTypes}
                            followers={comate.followerCount + (isFollowing ? 1 : 0)}
                            reviews={comate.reviewCount}
                            isFollowing={isFollowing}
                            onClick={() => handleCardClick(comate.memNo)}
                            onFollowClick={() => handleFollowClick(comate.nickname)}
                        />
                    </div>
                );
            })}
        </Slider>
    </div>
  );
}

export default Home_Comate;