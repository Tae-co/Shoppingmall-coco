import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import '../css/Comate.css';

import ComateFullProfile from './ComateFullProfile';
import ComateContent from './ComateContent';
import { 
    getProfile,
    getReviewList,
    getLikedList,
    getFollowerList,
    getFollowingList,
    follow,
    unfollow
} from '../utils/comate_api';
import { getCurrentMember } from '../utils/api';

const Comate = () => {
    const navigate = useNavigate();
    const { memNo, tab } = useParams();

    const [loginUser, setLoginUser] = useState(null);
    const [targetMemNo, setTargetMemNo] = useState(null);
    const [userType, setUserType] = useState('user');

    const [activeTab, setActiveTab] = useState(tab ||  'review');
    const [member, setMember] = useState(null);
    const [following, setFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [reviewList, setReviewList] = useState([]);
    const [likeList, setLikeList] = useState([]);
    const [followerList, setFollowerList] = useState([]);
    const [followingList, setFollowingList] = useState([]);

    const isMine = userType === 'me';

    /* 로그인 유저 정보 초기화 */
    useEffect(() => {
        const initUser = async () => {
            try {
                const current = await getCurrentMember();
                setLoginUser(current);

                // 사용자 본인이 로그인 한 경우
                if (!memNo || memNo === current.memNo.toString()) {
                    if (window.location.pathname !== `/comate/me/`) {
                        navigate('/comate/me/review', {replace: true});
                    }
                    setUserType('me');
                    setTargetMemNo(current.memNo);
                } else {
                    // 타 사용자 프로필 조회 or 로그인 하지 않은 사용자 
                    setUserType('user');
                    setTargetMemNo(memNo || null);
                }
            } catch (error) {
                console.error('로그인 유저 정보 불러오기 실패 (비로그인 상태/토큰 만료) ', error);

                // 비로그인-> userType='user' targetMemNo 는 URL 에서 가져옴
                setLoginUser(null);
                setUserType("user");
                setTargetMemNo(memNo);
            }
        }

        initUser();
    }, [memNo]);

    /* 회원 기본정보 조회 */
    useEffect(() => {
        if (!targetMemNo) return;

        const loadProfile = async () => {
            setLoading(true);
            try {
                const data = await getProfile(targetMemNo);
                setMember(data);
                setFollowing(data.following);
            } catch (error) {
                console.error(error);
                alert("회원 정보를 불러오는 중 오류가 발생했습니다. ");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [targetMemNo]);

    /* 탭별 데이터 조회 */
    useEffect(() => {
        if (!targetMemNo) return;

        const loadTabData = async() => {
            try {
                switch (activeTab) {
                    case 'review' :
                        const data = await getReviewList(targetMemNo);
                        setReviewList(data);
                        console.log("리뷰: ", data);
                        console.log("targetMemNo:::", targetMemNo);
                        break;
                    case 'like' :
                        const like = await getLikedList(targetMemNo);
                        setLikeList(like);
                        console.log("좋아요", like);
                        break;
                    case 'follower' :
                        setFollowerList(await getFollowerList(targetMemNo));
                        break;
                    case 'following' :
                        setFollowingList(await getFollowingList(targetMemNo));
                        break;
                    default:
                        break;
                }
            } catch (error) {
                console.error(error);
                alert(`${activeTab} 데이터를 불러오는 중 오류가 발생햇습니다.`);
            }
        };

        loadTabData();
    }, [activeTab, targetMemNo]);

    /* URL 파라미터 탭 변경 감지 */
    useEffect(() => {
        if (tab && tab !== activeTab) setActiveTab(tab);
    }, [tab]);

    /* 탭 클릭 */
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        if (userType === 'me') {
            navigate(`/comate/me/${tabName}`);
        } else {
            navigate(`/comate/user/${targetMemNo}/${tabName}`);
        }
    };

    /* Full Profile 팔로우/언팔로우 클릭 */
    const handleFollowClick = async () => {
        if (!loginUser) {
            alert('로그인이 필요한 기능입니다.');
            navigate('/login');
            return;
        }

        if (!member) return;

        try {
            if (following) {
                await unfollow(targetMemNo)
                setFollowing(false);
                setMember(prev => ({...prev, followerCount: Math.max((prev.followerCount || 1) - 1)}));
            } else {
                await follow(targetMemNo);
                setFollowing(true);
                setMember(prev => ({...prev,followerCount: (prev.followerCount || 0) + 1}));
            }
        } catch (error) {
            console.error(error);
            alert("팔로우/언팔로우 처리 중 오류가 발생했습니다.");
        }
    };

    if (loading || !member) return <div>로딩중...</div>;

    return (
        <div className="comate_wrapper">
            <ComateFullProfile
                nickname={member.memNickname}
                // skinTypes={member.skinTypes}
                likes={member.likedCount || 0}
                followers={member.followerCount || 0}
                following={member.followingCount || 0}
                onFollowClick={handleFollowClick}
                onTabClick={handleTabClick}
                isMine = {isMine}
                isFollowing={following}
            />
            <ComateContent 
                activeTab={activeTab}
                reviewList={reviewList}
                likeList={likeList}
                followerList={followerList}
                followingList={followingList}
                loginUserNo={loginUser?.memNo}

                setReviewList={setReviewList}
                setLikeList={setLikeList}
                setFollowerList={setFollowerList}
                setFollowingList={setFollowingList}

                targetMemNo={targetMemNo}
                
                onLikeChange={(liked) => {
                    // 다른 사람의 프로필인 경우 좋아요 상태변화 개수 반영하지 않음
                    if (targetMemNo !== loginUser?.memNo) return;

                    setMember(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            likedCount: liked 
                                        ? (prev.likedCount || 0) + 1
                                        : Math.max((prev.likedCount || 1 ) -1)   
                        }
                    });
                }}
                

                onListFollowChange={(type, newState) => {
                    // 리스트에서 팔로우/언팔로우 클릭-> Full Profile count 반영
                    // targetMember !== loginMember -> count 상태 변경 금지
                    if (targetMemNo !== loginUser?.memNo) return;

                    setMember(prev => {
                        if (!prev) return prev;
                        const updated = {...prev};

                        if (type === 'follower') {
                            updated.followerCount += newState ? 1 : -1;
                        } else if (type === 'following') {
                            updated.followingCount += newState ? 1 : -1;
                        }
                        return updated;
                    });
                }}
            />
        </div>
    );   
}

export default Comate;
