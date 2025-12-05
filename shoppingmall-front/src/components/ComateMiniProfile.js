import React from "react";

import '../css/ComateProfile.css';
import sampleImg_profile from '../images/sampleImg_profile.png'; // 임시 프로필 이미지


const ComateMiniProfile = ({
    nickname, 
    skinTags,  
    followers, 
    reviews, 
    isFollowing,
    matchingRate,
    onClick,
    onFollowClick
}) => {
    
    const getMatchClass = (matchingRate) => {
        if (70 <= matchingRate) return "high";
        if (40 <= matchingRate) return "medium";
        return "low";
    };
    
    return (
        <div className="comate_card mini" onClick={onClick}>
            <div className="profile_section mini">
                <img src={sampleImg_profile} alt="user_profile" className="profile_img mini" />
                <div className="nickname mini">{nickname}</div>
                <div className="skin_types mini">
                    {skinTags?.map((type, index) => (
                        <span key={index}>{type}</span>
                    ))}
                </div>
                <div className="matching_wrapper">
                    <div className="matching_title">궁합도</div>
                    <div className={`matching_rate ${getMatchClass(matchingRate)}`}>
                        {matchingRate === -1 ? '??' : matchingRate}
                        {matchingRate !== -1 && <span className="percent">%</span>}
                    </div>
                </div>
            </div>

            <div className="stats_section mini">
                <div className="stat_item mini">
                    <div className="stat_label mini">팔로워</div>
                    <div className="stat_value mini">{followers}</div>
                </div>
                <div className="stat_item mini">
                    <div className="stat_label mini">리뷰</div>
                    <div className="stat_value mini">{reviews}</div>
                </div>
            </div>
            <button
                className={`follow_btn mini ${isFollowing ? "active" : ""}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onFollowClick();
                }}
            >
                {isFollowing ? "팔로잉" : "팔로우"}
            </button>
        </div>
    );
};

export default ComateMiniProfile;