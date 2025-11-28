import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import '../css/ComateFollowListCard.css';
import sampleImg_profile from '../images/sampleImg_profile.png'; // 임시 프로필 이미지
import { follow, unfollow } from '../utils/comate_api';

const ComateFollowListCard = ({ 
    memNo, 
    nickname,
    skinTags, 
    isFollowing, 
    loginUserNo, 
    onFollowChange 
}) => {
    const isMine = loginUserNo === memNo; // 로그인 유저(본인) 프로필인 경우 팔로우 버튼 숨김
    const [followingState, setFollowingState] = useState(isFollowing || false);

    const handleClick = async () => {
        if (loginUserNo == null) {
            alert('로그인이 필요한 기능입니다.');
            return;
        }

        try {
            if (followingState) {
                await unfollow(memNo);
                setFollowingState(false);
                onFollowChange(false);
            } else {
                await follow(memNo);
                setFollowingState(true);
                onFollowChange(true);
            }
        } catch (error) {
            console.error(error);
            alert("팔로우/언팔로우 처리 중 문제가 발생했습니다.");
        }
    }

    return (
        <div className="uc_wrapper">
            <Link to={`/comate/user/${memNo}/review`}>
            <div className="uc_info_wrapper">
                <img src={sampleImg_profile} alt={nickname} className="profile_img"/>
                <div className="uc_info">
                    <div className="nickname">{nickname}</div>
                    <div className="skin_types">
                        {skinTags?.map((type, index) => (
                            <span key={index}>{type}</span>
                        ))}
                    </div>
                </div>
            </div>
            </Link>
            {!isMine && (
                <button 
                    onClick={handleClick}
                    className={`uc_follow_btn ${followingState ? "active" : ""}`}
                >
                    {followingState ? "팔로잉" : "팔로우"}
            </button>)}
        </div>
    );   
}

export default ComateFollowListCard;
