import React from "react";

import '../css/ComateProfile.css';
import sampleImg_profile from '../images/sampleImg_profile.png'; // 임시 프로필 이미지

const ComateFullProfile = ({ 
    nickname, 
    skinTags, 
    likes, 
    followers, 
    following, 
    onFollowClick, 
    onClick, 
    isMine, 
    isFollowing,
    matchingRate,
    onTabClick 
}) => {

    const getMatchClass = (matchingRate) => {
        if (80 <= matchingRate) return "high";
        if (50 <= matchingRate) return "medium";
        return "low";
    };

    return (
        <div className="comate_card_wrapper" onClick={onClick}>
            <div className="comate_card full">
            <div className="profile_section full">
                <img src={sampleImg_profile} alt="user_profile" className="profile_img full"
                onClick={(e) => { e.stopPropagation(); onTabClick('review'); }} />
                <div className="nickname full" onClick={(e) => { e.stopPropagation(); onTabClick('review'); }}>{nickname}</div>
                <div className="skin_types full">
                    {skinTags?.map((type, index) => (
                        <span key={index}>{type}</span>
                    ))}
                </div>
            </div>
            {/* 내 프로필이면 매칭률 숨기기 */}
            {!isMine && (
                <div className="matching_wrapper">
                     <div className="matching_title">궁합도</div>
                    <div className={`matching_rate ${getMatchClass(matchingRate)}`}>
                        {matchingRate === -1 ? '??' : matchingRate}
                        {matchingRate !== -1 && <span className="percent">%</span>}
                    </div>
                </div>
            )}
            <div className="stats_section full">
                <div className="stat_item full"
                onClick={(e) => { e.stopPropagation(); onTabClick('like'); }}>
                    <div className="stat_value full">{likes}</div>
                    <div className="stat_label full">좋아요</div>
                </div>
                <div className="stat_item full"
                onClick={(e) => { e.stopPropagation(); onTabClick('follower'); }}>
                    <div className="stat_value full">{followers}</div>
                    <div className="stat_label full">팔로워</div>
                </div>
                <div className="stat_item full"
                onClick={(e) => { e.stopPropagation(); onTabClick('following'); }}>
                    <div className="stat_value full">{following}</div>
                    <div className="stat_label full">팔로잉</div>
                </div>
            </div>
            </div>
            {/* 내 프로필이면 팔로우 버튼 숨기기 */}
            {!isMine && (
                <button
                    className={`follow_btn full ${isFollowing ? "active" : ""}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onFollowClick();
                    }}
                >
                    {isFollowing ? "팔로잉" : "팔로우"}
                </button>
            )}
        </div>
    );
};

export default ComateFullProfile;
