import { fetchWithAuth } from "./api";

const API_BASE_URL = '/comate';

/* 메인 화면용 - 전체 회원 목록 조회 */
export const getRandomComates = async() => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users`, {
        method : "GET"
    });

    if (!response.ok) throw new Error("회원 목록을 불러오지 못했습니다.");
    return response.json();
};

/* 프로필 정보 조회 */
export const getProfile = async (memNo) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/user/${memNo}`, {
        method : "GET"
    });
    if (!response.ok) throw new Error('회원정보 조회 실패');
    return response.json();
};

/* 사용자 작성 리뷰 목록 */
/*
export const getReviewList = async (targetMemNo, sort = "latest") => {
    const response = await fetchWithAuth(`${API_BASE_URL}/review/${targetMemNo}?sort=${sort}`);
    if (!response.ok) throw new Error("작성한 리뷰 조회 실패");
    return response.json();
}
*/
export const getReviewList = async (targetMemNo, options = {}) => {
    let sortParam = options.sort || 'latest';
    if (typeof sortParam === 'object') {
        sortParam = encodeURIComponent(JSON.stringify(sortParam));
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/review/${targetMemNo}?sort=${sortParam}`, {
        signal: options.signal
    });

    if (!response.ok) throw new Error("작성한 리뷰 조회 실패");
    return response.json();
};


/* 사용자가 좋아요 누른 리뷰 목록 */
export const getLikedList = async (targetMemNo, sort = "latest") => {
    const response = await fetchWithAuth(`${API_BASE_URL}/like/${targetMemNo}?sort=${sort}`);
    if (!response.ok) throw new Error("좋아요한 리뷰 조회 실패");
    return response.json();
}

/* 팔로워 목록 조회 */
export const getFollowerList = async (memNo) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/follow/followers/${memNo}`, {
        method: "GET"
    });
    if (!response.ok) throw new Error('팔로워 목록 조회 실패');
    return response.json();
}

/* 팔로잉 목록 조회 */
export const getFollowingList = async (memNo) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/follow/followings/${memNo}`, {
        method: "GET"
    });
    if (!response.ok) throw new Error('팔로잉 목록 조회 실패');
    return response.json();
};

/* 팔로우 */
export const follow = async (targetMemNo) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/follow/${targetMemNo}`, {
        method: "POST"
    });
    if (!response.ok) throw new Error('팔로우 실패');
    return response.text();
};

/* 언팔로우 */
export const unfollow = async (targetMemNo) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/unfollow/${targetMemNo}`, {
        method: "DELETE"
    });
    if (!response.ok) throw new Error('언팔로우 실패');
    return response.text();
};

/* 리뷰 좋아요 토글 */
export const toggleLike = async (reviewNo) => {
    const response = await fetchWithAuth(`/reviews/${reviewNo}/like`, {
        method: "POST"
    });
    if (!response.ok) throw new Error('좋아요 처리 실패');
    const result = await response.json();
    return result === 1;
};

/* 사용자 검색 */
export const searchMembers = async (nickname, options = {}) => {
    const encodedNickname = encodeURIComponent(nickname);
    const response = await fetchWithAuth(
        `${API_BASE_URL}/users/search?nickname=${encodedNickname}`,
        { signal: options.signal }
    );
    
    if (!response.ok) throw new Error('검색 실패');
    return response.json();
};

/* 추천 상품/리뷰/유저 조회 */
export const getRecommendation = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/recommend`, {
        method: "GET"
    });

    if (!response.ok) throw new Error("추천 조회 실패");
    return response.json();
}