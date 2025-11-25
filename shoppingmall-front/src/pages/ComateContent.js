import React, { useState } from 'react';

import ComateReviewCard from './ComateReviewCard';
import ComateFollowListCard from './ComateFollowListCard';
import { getReviewList, getLikedList } from '../utils/comate_api';

const ComateContent = ({ 
    activeTab,
    reviewList,
    likeList,
    followerList,
    followingList,
    loginUserNo,
    setReviewList,
    setLikeList,
    setFollowerList,
    setFollowingList,
    onListFollowChange,
    targetMemNo
}) => {

    let title = null;
    let content = null;
    const showSortAndCount = activeTab === 'review' || activeTab === 'like';
    const count = activeTab === 'review' ? reviewList.length
            : activeTab === 'like' ? likeList.length
            : 0;
    
    const [sortOption, setSortOption] = useState('latest');

    const updateListState = (listSetter, index, newState) => {
        if (typeof listSetter !== 'function') return; // console type error 방지

        listSetter(prev => {
            const newList = [...prev];
            newList[index] = {...newList[index], following: newState};
            return newList;
        });
    };

    const handleSortChange = async (e) => {
        const value = e.target.value;
        setSortOption(value);

        try {
            if (activeTab === 'review') {
                const sortedList = await getReviewList(targetMemNo, value);
                setReviewList(sortedList);
            } else if (activeTab === 'like') {
                const sortedList = await getLikedList(targetMemNo, value);
                setLikeList(sortedList);
            }
        } catch (error) {
            console.error(error);
            alert('리스트를 불러오는 중 오류가 발생했습니다.');
        }
    };

    switch(activeTab) {
        case 'review':
            title = "누적 리뷰";
            content = reviewList.map((item, index) => <ComateReviewCard 
                                                        key={`review-${item.id}-${index}`}
                                                        {...item} />);
            break;
        case 'like':
            title = "좋아요";
            content = likeList.map((item, index) => <ComateReviewCard 
                                                        key={`like-${item.id}-${index}`} 
                                                        {...item} 
                                                        authorNo={item.authorNo}
                                                        authorNickname={item.authorNickname}
                                                        onToggleLike={async (reviewNo, likedByCurrentUser) => {
                                                            if (likedByCurrentUser) {
                                                                setLikeList(prev => prev.filter(r => r.reviewNo !== reviewNo));
                                                            } 
                                                        }}
                                                        />);
            break;
        case 'follower':
            title = "팔로워";
            content = followerList.map((item, index) => (
                <ComateFollowListCard
                    key={item.memNo}
                    memNo={item.memNo}
                    nickname={item.nickname}
                    skinTypes={item.skinTypes}
                    isFollowing={item.following}
                    loginUserNo={loginUserNo}
                    listType="follower"
                    onFollowChange = {(newState) => {
                        updateListState(setFollowerList, index, newState);
                        if (typeof onListFollowChange === "function")
                            onListFollowChange("following", newState);
                    }}
                />
            ));
            break;
        case 'following':
            title = "팔로잉";
            content = followingList.map((item, index) => (
                <ComateFollowListCard
                    key={item.memNo}
                    memNo={item.memNo}
                    nickname={item.nickname}
                    skinTypes={item.skinTypes}
                    isFollowing={item.following}
                    loginUserNo={loginUserNo}
                    listType="following"
                    onFollowChange = {(newState) => {
                        updateListState(setFollowingList, index, newState);
                        if (typeof onListFollowChange === "function")
                            onListFollowChange("following", newState);
                    }}
                />
                ));
            break;
        default:
            content = <div>데이터 없음</div>;
    }

    return (
        <div className="comate_content_wrapper">
            <div className="content_top">
                <div className="content_title_wrapper">
                    <div className="content_title">{title}</div>
                    {showSortAndCount && (
                    <div className="content_count">{count}</div>)}
                </div>
                {showSortAndCount && (
                <select
                    className="sort_selector"
                    value={sortOption}
                    onChange={handleSortChange}
                >
                    <option value="latest">최신순</option>
                    <option value="highRating">별점 높은순</option>
                    <option value="lowRating">별점 낮은순</option>
                </select>
                )}
            </div>
            {/* 리스트 영역 */}
            <div className="content_list">{content}</div>
        </div>
    
    );
};

export default ComateContent;
