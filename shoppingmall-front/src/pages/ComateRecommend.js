import React, { useEffect, useState } from 'react';

import '../css/RecommendCard.css';

import RecommendUserCard from './RecommendUserCard';
import RecommendPrdCard from './RecommendPrdCard';
import { getRecommendation } from '../utils/comate_api';

const ComateRecommend = ({ loginUserNo }) => {
    const [recommendData, setRecommendData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRecommend = async () => {
            try {
                const data = await getRecommendation();
                console.log("[추천 조회 결과]", data);

                setRecommendData(data);
            } catch (err) {
                console.error("추천 불러오기 실패:", err);
            } finally {
                setLoading(false);
            }
        };

        loadRecommend();
    }, []);

    if (loading) return <div>추천 데이터를 불러오는 중입니다...</div>;
    if (!recommendData) return <div>추천 데이터가 없습니다.</div>;

    return (
        <div className="recommend_wrapper">
            COCO 만의 알고리즘을 활용해 사용자에게 꼭 맞는 추천 시스템을 제공합니다.
            <section>
                <div>
                    <div className="recommend_title">추천 CO-MATE</div>
                    <div className="recommend_sub">CO-MATE 를 팔로우</div>
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
                {/*
                {recommendData?.reviews?.map((review, index) => (
                    <ComateReviewCard
                    key={`${review.reviewNo}-${index}`}
                        {...review}
                        loginUserNo={loginUserNo}
                        // onToggleLike={handleReviewLikeToggle}
                    />
                ))}
                */}
                </div>
            </section>
            <section>
                <div>
                    <div className="recommend_title">이런 상품은 어떠세요?</div>
                    <div className="recommend_sub">팔로우하는 CO-MATE 가 구매한 상품이에요</div>
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

