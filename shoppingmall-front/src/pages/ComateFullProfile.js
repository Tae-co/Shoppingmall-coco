import React from "react";

import '../css/ComateProfile.css';
import sampleImg_profile from '../images/sampleImg_profile.png'; // 임시 프로필 이미지

const ComateFullProfile = ({ nickname, skinTypes, likes, followers, following, 
                            onFollowClick, onClick, isMine, isFollowing, onTabClick }) => {
    return (
        <div className="comate_card_wrapper" onClick={onClick}>
            <div className="comate_card full">
            <div className="profile_section full">
                <img src={sampleImg_profile} alt="user_profile" className="profile_img full"
                onClick={(e) => { e.stopPropagation(); onTabClick('review'); }} />
                <div className="nickname full" onClick={(e) => { e.stopPropagation(); onTabClick('review'); }}>{nickname}</div>
                <div className="skin_types full">
                    {skinTypes?.map((type, index) => (
                        <span key={index}>{type}</span>
                    ))}
                </div>
            </div>
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
