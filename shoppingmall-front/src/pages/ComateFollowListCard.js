import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/ComateFollowListCard.css';
import sampleImg_profile from '../images/sampleImg_profile.png';
import { follow, unfollow } from '../utils/comate_api';

const ComateFollowListCard = ({ 
    loginUserNo,
    memNo, 
    nickname,
    skinTags, 
    matchingRate,
    isFollowing, 
    onFollowChange 
}) => {
    const isMine = loginUserNo === memNo;
    const [followingState, setFollowingState] = useState(isFollowing || false);

    const handleClick = async () => {
        if (!loginUserNo) {
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

    const getMatchClass = (matchingRate) => {
        if (70 <= matchingRate) return "high";
        if (40 <= matchingRate) return "medium";
        return "low";
    };

    return (
        <div className="uc_wrapper">
            {/* 좌측 정보만 클릭 가능하도록 Link에 flex:1 */}
            <Link to={`/comate/user/${memNo}/review`} className="uc_info_wrapper">
                <div className="left">
                    <img src={sampleImg_profile} alt={nickname} className="profile_img"/>
                    <div className="uc_info">
                        <div className="nickname">{nickname}</div>
                        <div className="skin_types follow_list">
                            {skinTags?.map((type, index) => (
                                <span key={index}>{type}</span>
                            ))}
                        </div>
                    </div>
                </div>
                    {!isMine && (
                        <div className="right"> 
                            <div className="matching_title">궁합도</div>
                            <div className={`matching_rate list ${getMatchClass(matchingRate)}`}>
                                {matchingRate === -1 ? '??' : matchingRate}
                                {matchingRate !== -1 && <span className="percent">%</span>}
                            </div>
                        </div>
                    )}
            </Link>

            {/* 버튼은 Link 밖, 항상 오른쪽 끝 */}
            {!isMine && (
                <button 
                    onClick={handleClick}
                    className={`uc_follow_btn ${followingState ? "active" : ""}`}
                >
                    {followingState ? "팔로잉" : "팔로우"}
                </button>
            )}
        </div>
    );
}

export default ComateFollowListCard;
