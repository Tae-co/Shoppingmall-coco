import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import '../css/Comate.css';
import sampleImg_profile from '../images/sampleImg_profile.png';

import ComateFullProfile from './ComateFullProfile';
import ComateRecommend from './ComateRecommend';
import ComateContent from './ComateContent';
import { 
    getProfile,
    getReviewList,
    getLikedList,
    getFollowerList,
    getFollowingList,
    follow,
    unfollow,
    searchMembers
} from '../utils/comate_api';
import { getCurrentMember } from '../utils/api';
import useDebounde from '../hooks/useDebounce';

const Comate = () => {
    const navigate = useNavigate();
    const { memNo, tab } = useParams();

    const [loginUser, setLoginUser] = useState(null);
    const [targetMemNo, setTargetMemNo] = useState(null);
    const [userType, setUserType] = useState('user');

    const [activeTab, setActiveTab] = useState(tab || 'recommend');
    const [member, setMember] = useState(null);
    const [following, setFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [reviewList, setReviewList] = useState([]);
    const [likeList, setLikeList] = useState([]);
    const [followerList, setFollowerList] = useState([]);
    const [followingList, setFollowingList] = useState([]);

    const [nickname, setNickname] = useState("");
    const debouncedNickname = useDebounde(nickname, 400);
    const [searchResult, setSearchResult] = useState([]);
    const [showDropdown, SetShowDropdown] = useState(false);

    const isMine = userType === 'me';

    /* 로그인 유저 정보 초기화 */
    useEffect(() => {
        const initUser = async () => {
            try {
                const loginUser = await getCurrentMember();
                setLoginUser(loginUser);

                // 사용자 본인이 로그인 한 경우
                if (!memNo || memNo === loginUser.memNo.toString()) {
                    if (window.location.pathname !== `/comate/me/`) {
                        navigate('/comate/me', {replace: true});
                    }
                    setUserType('me');
                    setTargetMemNo(loginUser.memNo);
                } else {
                    // 타 사용자 프로필 조회 or 로그인 하지 않은 사용자 
                    setUserType('user');
                    setTargetMemNo(memNo || null);
                }
            } catch (error) {
                console.error('로그인 유저 정보 불러오기 실패 (비로그인 상태/토큰 만료) ', error);

                // 비로그인-> userType='user' targetMemNo 는 URL 에서 가져옴
                setLoginUser(null);
                setUserType("guest");
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

    /* 사용자 검색 */
    /*
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!nickname.trim()) return;

        try {
            const result = await searchMembers(nickname);
            console.log("[SearchMembers] 결과: ", result);
        } catch (error) {
            console.log("[SearchMembers] 실패: ", error);
        }
    };
    */
    // 입력값 변화 감지 검색
    /* 디바운스 API 호출 + AbortController 중복요청 취소 */
    useEffect(() => {
        if (!debouncedNickname.trim()) {
            setSearchResult([]);
            return;
        }  

        const controller = new AbortController();
        const fetchSearch = async () => {
            try {
                const result = await searchMembers(debouncedNickname, {signal: controller.signal});
                setSearchResult(result);
                SetShowDropdown(true);
            } catch (error) {
                if (error.name === "AbortError") {
                    console.log("검색 요청 취소");
                } else {
                    console.log("검색 오류: ", error);
                }
            }
        };
        
        fetchSearch();
        return () => controller.abort();
    }, [debouncedNickname]);

    const handleSelectMember = (memNo) => {
        setNickname("");
        setSearchResult([]);
        SetShowDropdown(false);
        navigate(`/comate/user/${memNo}/review`);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".search_container")) {
                SetShowDropdown(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    /* 탭별 데이터 조회 */
    /* React 18 strict mode - AbortController  */
    useEffect(() => {
        if (!targetMemNo) return;

        const controller = new AbortController();

        const loadTabData = async() => {
            try {
                switch (activeTab) {
                    case 'review' :
                        setReviewList(await getReviewList(targetMemNo, {signal: controller.signal}));
                        break;
                    case 'like' :
                        setLikeList(await getLikedList(targetMemNo));
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
                if (error.name === 'AbortError') {
                    console.log(`[TabData] 요청 취소됨 targetMemNo=${targetMemNo} tab=${activeTab}`);
                } else {
                    console.error(error);
                    alert(`${activeTab} 데이터를 불러오는 중 오류가 발생햇습니다.`);
                }
            }
        };

        loadTabData();
        return () => {
            controller.abort();
        }
    }, [activeTab, targetMemNo]);

    /* URL 파라미터 탭 변경 감지 */
    useEffect(() => {
        if (tab && tab !== activeTab) setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth'});
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
            {/* 사용자 검색창 */}
            <div className="comate_top">
                <div className="comate_search_container">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <input 
                            type="text" name="search" 
                            value={nickname} placeholder="당신의 CO-MATE 를 찾아보세요!"
                            onChange={(e) => setNickname(e.target.value)} />
                        <button type="submit" className="btn_search">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="" viewBox="0 0 24 24" width="20" height="20">
                                <path fill="#777777" fillRule="evenodd" d="M15.571 16.631a8.275 8.275 0 1 1 1.06-1.06l4.5 4.498-1.061 1.06-4.499-4.498Zm1.478-6.357a6.775 6.775 0 1 1-13.55 0 6.775 6.775 0 0 1 13.55 0Z" clipRule="evenodd"></path>
                            </svg>
                        </button>
                    </form>
                    <div className="search_dropdown">
                        {showDropdown && searchResult.length > 0 && (
                            <ul>
                                {searchResult.map(user => (
                                    <li key={user.memNo}
                                        onClick={() => handleSelectMember(user.memNo)}
                                    >
                                        <img src={sampleImg_profile} className="search_result_profile"></img>
                                        <span>{user.memNickname}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {showDropdown && searchResult.length === 0 && debouncedNickname.trim() !== "" && (
                            <div className="no_result">등록되지 않은 CO-MATE 입니다. </div>   
                        )}
                    </div>
                </div>
            </div>
            <div className="comate_main">
                {/* 사용자 프로필 */}
                <ComateFullProfile
                    nickname={member.memNickname}
                    skinTags={member.skinTags}
                    reviews={member.reviewCount}
                    likes={member.likedCount || 0}
                    followers={member.followerCount || 0}
                    following={member.followingCount || 0}
                    isMine = {isMine}
                    isFollowing={following}
                    matchingRate={member.matchingRate}

                    onFollowClick={handleFollowClick}
                    onTabClick={handleTabClick}
                />
                {/* 탭 별 컨텐츠 */}
                { activeTab === 'recommend' ? (
                    <ComateRecommend loginUserNo={loginUser?.memNo} />
                ) : (
                <ComateContent 
                    activeTab={activeTab}

                    loginUserNo={loginUser?.memNo}
                    targetMemNo={targetMemNo}
                    
                    reviewList={reviewList}
                    likeList={likeList}
                    followerList={followerList}
                    followingList={followingList}

                    setReviewList={setReviewList}
                    setLikeList={setLikeList}
                    setFollowerList={setFollowerList}
                    setFollowingList={setFollowingList}

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
                )}
            </div>
        </div>
    );   
}

export default Comate;
