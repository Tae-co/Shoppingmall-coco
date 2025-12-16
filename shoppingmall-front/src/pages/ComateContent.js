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
    setReviewList,
    setLikeList,
    setFollowerList,
    setFollowingList,
    onListFollowChange,
    onLikeChange,
    loginUserNo,
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
            // console.error(error);
            alert('리스트를 불러오는 중 오류가 발생했습니다.');
        }
    };

    const getEmptyMessage = (tab) => {
        const isMyPage = loginUserNo === targetMemNo;
    
        const messages = {
            review: isMyPage
                ? "아직 작성한 리뷰가 없어요.\n나만의 뷰티 경험을 공유해보세요!"
                : "아직 작성한 리뷰가 없어요.",
            like: isMyPage
                ? "좋아요한 리뷰가 아직 없어요.\n마음에 드는 리뷰에 좋아요를 눌러보세요!"
                : "좋아요한 리뷰가 없습니다.",
            follower: isMyPage
                ? "아직 팔로워가 없어요.\n리뷰와 활동을 통해 나를 알려보세요!"
                : "아직 팔로워가 없어요.",
            following: isMyPage
                ? "아직 팔로우한 메이트가 없어요.\n취향이 맞는 유저를 팔로우해보세요!"
                : "팔로잉한 유저가 없습니다."
        };
    
        return messages[tab];
    };    

    switch(activeTab) {
        case 'review':
            title = "누적 리뷰";
            if (reviewList.length === 0) {
                content = <div className="empty_state">{getEmptyMessage('review')}</div>;
                break;
            }
            content = reviewList.map((item) => <ComateReviewCard 
                                                    key={item.reviewNo}
                                                    {...item}
                                                    onToggleLike={async (reviewNo, likedByCurrentUser) => {
                                                        setReviewList(prev => prev.map(r =>
                                                        r.reviewNo === reviewNo ? {
                                                            ...r, 
                                                            likedByCurrentUser: !likedByCurrentUser,
                                                            likeCount: likedByCurrentUser ? r.likeCount - 1 : r.likeCount + 1
                                                            } : r
                                                        ));
                                                        if (typeof onLikeChange === 'function') onLikeChange(!likedByCurrentUser);
                                                    }} 
                                                    isLoggedIn={!!loginUserNo}
                                                    loginUserNo={loginUserNo}
                                                />);
            break;
        case 'like':
            title = "좋아요";
            if (likeList.length === 0) {
                content = <div className="empty_state">{getEmptyMessage('like')}</div>;
                break;
            }
            content = likeList.map((item) => <ComateReviewCard 
                                                    key={item.reviewNo} 
                                                    {...item} 
                                                    authorNo={item.authorNo}
                                                    authorNickname={item.authorNickname}
                                                    onToggleLike={async (reviewNo, likedByCurrentUser) => {
                                                        if (likedByCurrentUser) {
                                                            setLikeList(prev => prev.filter(r => r.reviewNo !== reviewNo));
                                                        } 
                                                        if (typeof onLikeChange === 'function') onLikeChange(!likedByCurrentUser);
                                                    }}
                                                    isLoggedIn={!!loginUserNo}
                                                    loginUserNo={loginUserNo}
                                                 />);
            break;
        case 'follower':
            title = "팔로워";
            if (followerList.length === 0) {
            content = <div className="empty_state">{getEmptyMessage('follower')}</div>;
            break;
        }
            content = followerList.map((item, index) => (
                <ComateFollowListCard
                    key={item.memNo}
                    memNo={item.memNo}
                    nickname={item.nickname}
                    skinTags={item.skinTags}
                    isFollowing={item.following}
                    matchingRate={item.matchingRate}
                    loginUserNo={loginUserNo}
                    onFollowChange = {(newState) => {
                        updateListState(setFollowerList, index, newState);
                        if (typeof onListFollowChange === "function")
                            onListFollowChange("following", newState);
                    }}
                    isLoggedIn={!!loginUserNo}
                />
            ));
            break;
        case 'following':
            title = "팔로잉";
            if (followingList.length === 0) {
                content = <div className="empty_state">{getEmptyMessage('following')}</div>;
                break;
            }
            content = followingList.map((item, index) => (
                <ComateFollowListCard
                    key={item.memNo}
                    memNo={item.memNo}
                    nickname={item.nickname}
                    skinTags={item.skinTags}
                    isFollowing={item.following}
                    matchingRate={item.matchingRate}
                    loginUserNo={loginUserNo}
                    onFollowChange = {(newState) => {
                        updateListState(setFollowingList, index, newState);
                        if (typeof onListFollowChange === "function")
                            onListFollowChange("following", newState);
                    }}
                    isLoggedIn={!!loginUserNo}
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
