import React from 'react';
import { Link } from 'react-router-dom';

import sampleImg_profile from '../images/sampleImg_profile.png';

const RecommendUserCard = ({
    memNo,
    nickname,
    matchingRate
}) => {

    const getMatchClass = (matchingRate) => {
        if (70 <= matchingRate) return "high";
        if (40 <= matchingRate) return "medium";
        return "low";
    };

    return (
        <div className="recommend_user_wrapper">
        <Link to={`/comate/user/${memNo}/review`}>
            <img src={sampleImg_profile} className="profile_img recommend_user"/>
            <div className="user_info">
                <div className="recommend_user_nickname">{nickname}</div>
                <div className="matching_wrapper">
                    <div className="matching_title">궁합도</div>
                    <div className={`matching_rate  ${getMatchClass(matchingRate)}`}>
                        {matchingRate}
                        <span className="percent">%</span>
                    </div>
                </div>
            </div>
        </Link>
        </div>
    );
}

export default RecommendUserCard;
