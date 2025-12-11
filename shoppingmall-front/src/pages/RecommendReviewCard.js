import React from 'react';
import { Link } from 'react-router-dom';

import '../css/ComateReviewCard.css';

import sampleImg_profile from '../images/sampleImg_profile.png'; // 임시 프로필 이미지
import starIcon from '../images/review_rate_icon_star.png';

const RecommendReviewCard = ({
    productNo, productName, productOption, createdAt, productImg,
    rating, content, tags, 
    authorNo, authorNickname
}) => {
    const totalStar = 5;
    const filledStar = rating;
    const emptyStar = totalStar - filledStar;

    return (
        <div className="comate_review_wrapper">
            <Link to={`/products/${productNo}`}>
                <div className="comate_product_info">
                    <img src={productImg} alt={productName} className="product_img comate"/>
                    <div className="text_info">
                        <div className="product_name">{productName}</div>
                        <div className="product_option">{productOption}</div>
                    </div>
                </div>
            </Link>
            <div className="review_info">
                {authorNickname && (
                    <Link to={`/comate/user/${authorNo}`}>
                    <div className="author_info">
                        <img src={sampleImg_profile} alt={authorNickname} className="author_img"/>
                        <div className="author_name">{authorNickname}</div>
                    </div>
                    </Link>
                )}
                <div className="review_header">
                    <div className="review_star">
                        {[...Array(filledStar)].map((_, i) => (
                            <img key={`filled-${i}`} src={starIcon} alt="star" />
                        ))}
                        {[...Array(emptyStar)].map((_, i) => (
                            <img key={`empty-${i}`} src={starIcon} alt="star" style={{filter: 'grayscale(100%)', opacity: 0.3}} />
                        ))}
                    </div>
                    <div className="review_meta">작성일자 {createdAt}</div>
                </div>
                <div className="review_tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</div>
                <div className="review_content">{content}</div>
            </div>
        </div>
    );   
}

export default RecommendReviewCard;
