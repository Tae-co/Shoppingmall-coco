import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../css/RecommendCard.css';

import RecommendUserCard from './RecommendUserCard';
import RecommendReviewCard from './RecommendReviewCard';
import RecommendPrdCard from './RecommendPrdCard';
import { getRecommendation } from '../utils/comate_api';

const ComateRecommend = ({ loginUserNo }) => {
    const navigate = useNavigate();

    const [recommendData, setRecommendData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRecommend = async () => {
            try {
                const data = await getRecommendation();
                setRecommendData(data);
                console.log(data);
            } catch (err) {
                // console.error("추천 불러오기 실패:", err);
                alert("잠시 후 다시 접속해주세요.");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        loadRecommend();
    }, []);

    const needSkinProfile = 
        recommendData?.users?.length > 0 &&
        recommendData.users.every(user => user.matchingRate === null);

    if (loading) return <div>추천 데이터를 불러오는 중입니다...</div>;
    if (!recommendData) return <div>추천 데이터가 없습니다.</div>;

    return (
        <div className="recommend_wrapper">
            <section>
                <div>
                    <div className="recommend_title">추천 CO-MATE</div>
                    <div className="recommend_sub">CO-MATE 를 팔로우하고 맞춤 서비스를 받아보세요</div>
                    {needSkinProfile && (
                        <div className="recommend_sub fallback" 
                            onClick={(e) => {e.stopPropagation(); navigate("/profile-edit");}}>
                            피부 프로필을 등록하고 더 똑똑해진 CO-MATE 추천을 받아보세요!
                        </div>
                    )}
                </div>
                <div className="recommend_grid_4">
                {recommendData?.users?.map((user) => (
                    <RecommendUserCard key={user.memNo} {...user} />
                ))} 
                </div>
            </section>
            <section>
                <div>
                    <div className="recommend_title">추천 리뷰</div>
                    <div className="recommend_sub">이 리뷰, 당신에게 도움이 될 거예요</div>
                </div>
                <div>
                
                {recommendData?.reviews?.map((review, index) => (
                    <RecommendReviewCard
                    key={review.reviewNo}
                        {...review}
                        loginUserNo={loginUserNo}
                    />
                ))}
                
                </div>
            </section>
            <section>
                <div>
                    <div className="recommend_title">이런 상품은 어떠세요?</div>
                    <div className="recommend_sub"></div>
                </div>
                <div className="recommend_grid_4">
                {recommendData?.products?.map((product) => (
                    <RecommendPrdCard key={product.productNo} {...product} />
                ))} 
                </div>
            </section>
        </div>
    );
}

export default ComateRecommend;

