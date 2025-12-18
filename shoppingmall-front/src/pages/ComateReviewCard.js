import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import '../css/ComateReviewCard.css';

import sampleImg_profile from '../images/sampleImg_profile.png'; // 임시 프로필 이미지
import starIcon from '../images/review_rate_icon_star.png';
import detailIcon from '../images/detailIcon.svg';
import { toggleLike } from '../utils/comate_api';

const ComateReviewCard = ({
    reviewNo,
    productNo, productName, productOption, createdAt, productImg,
    rating, content, tags, 
    likeCount, likedByCurrentUser,
    authorNo, authorNickname,
    reviewImages,
    onToggleLike,
    loginUserNo
}) => {

    const totalStar = 5;
    const filledStar = rating;
    const emptyStar = totalStar - filledStar;

    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = (e) => {
        e.stopPropagation();
        setIsExpanded(prev => !prev);
    };

    const handleLikeClick = async () => {
        if (loginUserNo == null) {
            alert('로그인이 필요한 기능입니다.');
            return;
        }

        try {
            if (onToggleLike) {
                onToggleLike(reviewNo, likedByCurrentUser);
                await toggleLike(reviewNo, likedByCurrentUser);
            }
        } catch (error) {
            // console.error(error);
            alert('좋아요 처리 중 오류가 발생했습니다.');
        }
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
                <div className="review_like_wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="100%" viewBox="0 0 20 20" 
                    fill={likedByCurrentUser ? "red" : "none"} stroke="red" strokeWidth="2"
                    onClick={handleLikeClick} style={{cursor: 'pointer'}} >
                        <path d="M9.79493 16.3061C9.91046 16.4154 10.0895 16.4154 10.2051 16.3061C11.1045 15.4553 14.7235 12.0265 16.25 10.5C16.8895 9.85325 17.5 8.75 17.5 7.5C17.5 5.34156 15.8342 3.5 13.75 3.5C11.9105 3.5 11 4.99545 10 6.25C9 4.99545 8.08947 3.5 6.25 3.5C4.16579 3.5 2.5 5.34156 2.5 7.5C2.5 8.75 3.11053 9.85325 3.75 10.5C5.27651 12.0265 8.89549 15.4553 9.79493 16.3061Z" strokeWidth="1.4" strokeMiterlimit="10"></path>
                    </svg>
                    <div>좋아요 {likeCount}</div>
                </div>
        </div>
        </div>
    );   
}

export default ComateReviewCard;
