import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import '../css/ComateReviewCard.css';

import sampleImg_profile from '../images/sampleImg_profile.png'; // 임시 프로필 이미지
import starIcon from '../images/review_rate_icon_star.png';
import detailIcon from '../images/detailIcon.svg';

const RecommendReviewCard = ({
    productNo, productName, productOption, createdAt, productImg,
    rating, content, tags, 
    authorNo, authorNickname,
    reviewImages
}) => {
    const totalStar = 5;
    const filledStar = rating;
    const emptyStar = totalStar - filledStar;

    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = (e) => {
        e.stopPropagation();
        setIsExpanded(prev => !prev);
    };

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
                {/* 리뷰 이미지 */}
                {reviewImages && reviewImages.length > 0 && (
                    <div className="review_images">
                        {reviewImages.map((img) => (
                            <img
                                key={img.reviewImageNo}
                                src={`http://13.231.28.89:18080${img.imageUrl}`}
                                alt="리뷰 이미지"
                                className="review_img"
                            />
                        ))}
                    </div>
                )}
                <div className="review_tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</div>
                <div className="review_content_wrapper">
                    <p className={`review_content ${isExpanded ? 'expanded' : 'clamped'}`}>
                    {content}
                    </p>

                    {/* 내용이 길 때만 더보기 버튼 */}
                    {content && content.length > 80 && (
                        <div className="detail-box" onClick={toggleExpand}>
                            <img src={detailIcon} alt="더보기" />
                            <span>{isExpanded ? '간략히 보기' : '더보기'}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );   
}

export default RecommendReviewCard;
