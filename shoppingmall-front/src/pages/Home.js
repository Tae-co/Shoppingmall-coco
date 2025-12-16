import React from 'react';

import '../css/Home.css';

import SimpleSlider from './SimpleSlider'; // 메인배너 슬라이더 컴포넌트
import BestSeller from './BestSeller'; // 인기상품 슬라이더 컴포넌트
import HomeComate from './Home_Comate';

const Home = () => {

    return (
        <div>
            {/* 슬라이더 배너 */}
            <SimpleSlider />
            <div className="home_content">
                {/* 인기 상품 영역 */}
                <div className="popular_product_wrapper">
                    <div className="popular_title">
                        <h2>BEST SELLER</h2>
                        <div className="sub_title">COCO의 베스트 아이템을 만나보세요</div>
                    </div>
                    <div className="popular_list">
                    <BestSeller />   
                    </div>
                </div>
                {/* CO-MATE 추천 영역 */}
                <div className="comate_recommend_wrapper">
                    <div className="comate_title">
                        <h2>CO-MATE</h2>
                        <div className="sub_title_wrapper">
                            <div className="sub_title">신뢰할 수 있는 뷰티 전문가들을 팔로우하세요</div>
                        </div>
                    </div>
                    <div className="comate_list">
                    <HomeComate/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;