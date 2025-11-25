import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../css/BestSeller.css';

import ProductCard from '../components/ProductCard';
import { fetchWithAuth, isLoggedIn, getStoredMember } from '../utils/api'; // 장바구니 기능용

// 영어 -> 한글 변환 맵
const skinTypeMap = {
    dry: '건성',
    oily: '지성',
    combination: '복합성',
    sensitive: '민감성',
    all: '모든 피부'
};

function MultipleItems() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);

    const settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
        // 반응형 설정 (상품 개수가 적을 때 깨짐 방지)
        responsive: [
            {
                breakpoint: 1024,
                settings: { slidesToShow: 3 }
            },
            {
                breakpoint: 600,
                settings: { slidesToShow: 2 }
            },
            {
                breakpoint: 480,
                settings: { slidesToShow: 1 }
            }
        ]
    };

    // 컴포넌트 로드 시 '인기 상품' 10개 가져오기
    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                // sort=popularity, size=10으로 요청
                const response = await fetch('http://localhost:8080/api/products?page=1&size=10&sort=popularity');
                if (!response.ok) throw new Error("데이터 로드 실패");

                const data = await response.json();

                // 판매중지 상품은 아예 목록에서 제외
                const validProducts = (data.content || []).filter(p => p.status !== '판매중지');
                setProducts(validProducts);

            } catch (error) {
                console.error("베스트 상품 로드 중 오류:", error);
            }
        };

        fetchBestSellers();
    }, []);

    // 상품 클릭 시 상세 페이지 이동
    const handleProductClick = (prdNo) => {
        navigate(`/products/${prdNo}`);
    };

    // 장바구니 담기 핸들러 (ProductListPage 로직 재사용)
    const handleAddToCart = async (e, product) => {
        e.stopPropagation(); // 부모 클릭 이벤트(상세 이동) 방지

        // 품절 체크
        if (product.status === '품절') {
            alert("현재 품절된 상품입니다.");
            return;
        }

        if (!isLoggedIn()) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login');
            return;
        }

        const member = getStoredMember();
        if (!product.defaultOptionNo) {
            alert('옵션을 선택해야 하는 상품입니다. 상세 페이지에서 담아주세요.');
            navigate(`/products/${product.prdNo}`);
            return;
        }

        try {
            const response = await fetchWithAuth('/coco/members/cart/items', {
                method: 'POST',
                body: JSON.stringify({
                    memNo: member.memNo,
                    optionNo: product.defaultOptionNo,
                    cartQty: 1
                })
            });

            if (response.ok) {
                if (window.confirm('장바구니에 담았습니다. \n장바구니로 이동하시겠습니까?')) {
                    navigate('/cart');
                }
            } else {
                alert('장바구니 담기에 실패했습니다.');
            }
        } catch (error) {
            console.error(error);
            alert('오류가 발생했습니다.');
        }
    };

    // 데이터가 없을 경우 처리
    if (products.length === 0) {
        return <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>등록된 베스트 상품이 없습니다.</div>;
    }

    return (
        <div className="slider-container">
            <Slider {...settings}>
                {products.map((p, index) => {

                    // 상태값 공백 제거 후 비교
                    const safeStatus = p.status ? p.status.trim() : "";
                    const isSoldOut = safeStatus === '품절' || safeStatus === 'SOLD_OUT';

                    // 태그 한글 변환 로직
                    const koreanSkinTypes = p.skinTypes
                        ? p.skinTypes.map(type => skinTypeMap[type] || type)
                        : [];

                    return (
                        <div key={p.prdNo} style={{ padding: '10px', position: 'relative' }}> {/* 슬라이드 간 간격 조정 */}

                            {/* ProductCard 표시*/}
                            <ProductCard
                                name={p.prdName}
                                productSkinType={koreanSkinTypes}
                                price={p.prdPrice.toLocaleString()}
                                image={p.imageUrl}
                                star_avg={p.averageRating}
                                reviewCount={p.reviewCount}
                                onClick={() => handleProductClick(p.prdNo)}
                                onAddToCart={(e) => handleAddToCart(e, p)}
                                // 상태와 순위 정보만 넘겨줌
                                isSoldOut={isSoldOut}
                                rank={index + 1} 
                            />
                        </div>
                    );
                })}
            </Slider>
        </div>
    );
}

export default MultipleItems;