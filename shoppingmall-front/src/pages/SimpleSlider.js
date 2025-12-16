import React from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../css/SimpleSlider.css';

import bannerImgSkincare from '../images/banner/banner_skincare_bg.png';
import bannerImgMakeup from '../images/banner/banner_makeup_bg.png';
import bannerImgBody from '../images/banner/banner_body_bg.png';
import bannerImgHomme from '../images/banner/banner_homme_bg.png';

function SimpleSlider() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        autoplay: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true
    };

    // 슬라이드 데이터 배열
    const slides = [
        {
            id: 'skincare',
            bg: bannerImgSkincare,
            title: <>촉촉하게 차오르는<br />수분 광채</>,
            desc: <>건조한 피부에 즉각적인 생기를 더하는<br />코코의 수분 솔루션</>,
            link: '/product?categoryNo=1',
            btnText: '스킨케어 라인 보기 >',
            contentClass: 'align-right theme-skincare',
            btnClass: 'btn-round btn-skincare'
        },
        {
            id: 'makeup',
            bg: bannerImgMakeup,
            title: <>설렘 가득,<br />메이크업</>,
            desc: <>당신의 일상을 화사하게 밝혀줄<br />코코의 로맨틱 컬렉션</>,
            link: '/product?categoryNo=2',
            btnText: '메이크업 라인 보기 >',
            contentClass: 'align-right theme-makeup',
            boxClass: 'glass-box', // 반투명 박스 사용
            btnClass: 'btn-round btn-makeup'
        },
        {
            id: 'body',
            bg: bannerImgBody,
            title: <>일상 속 작은 쉼표,<br />내추럴 바디 케어</>,
            desc: <>지친 몸과 마음에 전하는<br />자연의 깊은 위로</>,
            link: '/product?categoryNo=3',
            btnText: '바디/헤어 라인 보기 >',
            contentClass: 'align-right theme-body',
            boxClass: 'glass-box',
            btnClass: 'btn-round btn-body'
        },
        {
            id: 'homme',
            bg: bannerImgHomme,
            title: <>그 남자의 관리법,<br />코코 옴므</>,
            desc: '복잡한 단계 없이, 심플하고 완벽하게',
            link: '/product?categoryNo=4',
            btnText: '옴므 라인 보기 >',
            contentClass: 'align-right theme-homme',
            btnClass: 'btn-round btn-homme'
        }
    ];

    return (
        <div className="slider_container">
            <Slider {...settings}>
                {slides.map((slide) => (
                    <div key={slide.id}>
                        <div
                            className="slide"
                            style={{ backgroundImage: `url(${slide.bg})` }}
                        >
                            <div className={`banner-content ${slide.contentClass}`}>
                                {slide.boxClass ? (
                                    <div className={slide.boxClass}>
                                        <h3>{slide.title}</h3>
                                        <p>{slide.desc}</p>
                                        <Link to={slide.link} className={`banner-btn ${slide.btnClass}`}>
                                            {slide.btnText}
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        <h3>{slide.title}</h3>
                                        <p>{slide.desc}</p>
                                        <Link to={slide.link} className={`banner-btn ${slide.btnClass}`}>
                                            {slide.btnText}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
}

export default SimpleSlider;