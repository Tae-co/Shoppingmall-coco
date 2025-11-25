import edit from '../images/edit.svg'
import del from '../images/delete.svg'
import { useNavigate } from 'react-router-dom'
import UseStarRating from '../features/UseStarRating.js'
import { useState, useEffect } from 'react'
import greyStar from '../images/greyStar.svg'
import yellowStar from '../images/yellowStar.svg'
import detailIcon from '../images/detailIcon.svg'
import love from '../images/love.png'
import '../css/ReviewDetail.css'
import { isLoggedIn, getStoredMember, storage, STORAGE_KEYS } from '../utils/api'
import axios from 'axios'
function ReviewDetail({ reviewData, onDelete }) {
    const navigate = useNavigate();

    // const ptags = ["보습력이 좋아요", "향이 좋아요", "발림성 좋아요"
    //     , "흡수가 빨라요", "끈적임 없어요", "피부 진정", "화이트닝 효과"
    //     , "주름 개선", "모공 케어", "민감성 피부 OK", "가성비 좋아요"
    // ]

    // const ntags = ["보습력이 부족해요", "향이 별로예요", "발림성 안 좋아요"
    //     , "흡수가 느려요", "끈적여요", "자극이 있어요", "효과 없어요"
    //     , "피부 트러블", "가격이 비싸요", "용량이 적어요", "제품이 변질됐어요"
    // ]

    const {
        reviewNo,
        userNickname,
        createdAt,
        rating,
        content,
        prosTags,
        consTags,
        reviewImages,
        likeCount,
        memNo: reviewAuthorMemNo
    } = reviewData;

    const [like, setlike] = useState(likeCount || 0);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // 현재 로그인한 사용자 정보
    const currentMember = getStoredMember();
    const currentMemNo = currentMember?.memNo;
    
    // 리뷰 작성자와 현재 로그인한 사용자가 일치하는지 확인
    const isReviewAuthor = isLoggedIn() && currentMemNo && reviewAuthorMemNo && currentMemNo === reviewAuthorMemNo;

    const { starTotal, clicked, starArray, setRating } = UseStarRating(0);

    // 자신이 리뷰한 내용에만 수정 삭제 아이콘 보이기 
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    useEffect(() => {
        setRating(rating);
        setlike(likeCount || 0);
    }, [rating, likeCount]);

    const updateReview = () => {
        navigate(`/update-reviews/${reviewNo}`);
    }

    const handleDeleteReview = async () => {
        const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
        if (confirmDelete) {
            try {
                // 리뷰 삭제 (인증 필요)
                const token = storage.get(STORAGE_KEYS.TOKEN);
                const headers = {};
                
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                await axios.delete(`http://localhost:8080/api/reviews/${reviewNo}`, { headers });
                onDelete(reviewNo);
            } catch (error) {
                console.error("리뷰 삭제에 실패했습니다:", error);
                alert("리뷰 삭제 중 오류가 발생했습니다.");
            }
        }
    }

    const addLike = async () => {
        if (!isLoggedIn()) {
            alert('로그인이 필요합니다.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/reviews/${reviewNo}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const updatedLikeCount = await response.json();
                setlike(updatedLikeCount);
            } else {
                const error = await response.json();
                alert(error.message || '좋아요 처리에 실패했습니다.');
            }
        } catch (error) {
            console.error('좋아요 처리 오류:', error);
            alert('좋아요 처리에 실패했습니다.');
        }
    }

    return (

        <div className="reviewBox">
            <div className="headBox">
                <div className="name-star">
                    <span className='username'>{userNickname}</span>
                    <div className='stars'>
                        {starArray.map((stars, i) => (
                            <img
                                key={i}
                                src={clicked[i] ? yellowStar : greyStar}
                            />
                        ))}
                    </div>
                </div>
                <div className="date-edit">
                    <span className='date'>{createdAt ? createdAt.split('T')[0] : ''}</span>
                    {isReviewAuthor && (
                        <>
                            <img className="icon-btn" src={edit} onClick={updateReview} />
                            <img className="icon-btn" src={del} onClick={handleDeleteReview} />
                        </>
                    )}
                </div>
            </div>
            <div className='imgBox'>
                {reviewImages && reviewImages.map((img, i) => (
                    <img className="tag" key={i} src={img.imageUrl} alt="리뷰 이미지" />
                ))}
            </div>
            <div className="tagBox">
                {prosTags && prosTags.map((ptag, i) => (
                    <span key={`p-${i}`}>{ptag.tagName}</span>
                ))}
                {consTags && consTags.map((ntag, i) => (
                    <span key={`n-${i}`}>{ntag.tagName}</span>
                ))}
            </div>
            <div className="textBox">
                <p className={isExpanded ? 'expanded' : 'clamped'}>
                    {content}
                </p>
            </div>
            <div
                className={`detail-box ${isExpanded ? 'expanded' : ''}`}
                onClick={toggleExpand}
            >
                <img src={detailIcon} alt={isExpanded ? '접기' : '더보기'} />
                <span>{isExpanded ? '간략히 보기' : '더보기'}</span>
            </div>
            <div className='like'>
                <img src={love} onClick={addLike} />
                <span>{like}</span>
            </div>
        </div>

    );
}

export default ReviewDetail;