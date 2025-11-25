import { useState, useEffect } from "react";
import ReviewDetail from "./ReviewDetail";
import axios from "axios";

function ProductReviews({ productNo }) {

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleDeleteReview = async (reviewNo) => {
        try {
            const token = localStorage.getItem('token');
            const headers = {};
  
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            await axios.delete(`http://localhost:8080/api/reviews/${reviewNo}`, { headers });
            setReviews(currentReviews =>
                currentReviews.filter(review => review.reviewNo !== reviewNo))
        } catch (error) {
            console.error("리뷰 삭제에 실패했습니다:", error);
            alert("리뷰 삭제 중 오류가 발생했습니다.");
        }
    };

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:8080/api/products/${productNo}/reviews`);
                setReviews(response.data);
            } catch (error) {
                console.error("리뷰 목록을 불러오는데 실패했습니다:", error);
            }
            setLoading(false);
        };

        fetchReviews();
    }, [productNo]);

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>리뷰를 불러오는 중...</div>;
    }

    if (reviews.length === 0) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>작성된 리뷰가 없습니다.</div>;
    }

    return (
        <div className="review-list-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ padding: '0 28px' }}>리뷰 (총 {reviews.length}개)</h2>

            {reviews.map((review) => (
                // 4. 각 리뷰 데이터를 'reviewData'라는 prop으로 전달
                // 'key'는 React가 각 항목을 구별하기 위해 필수입니다.
                <ReviewDetail
                    key={review.reviewNo}
                    reviewData={review}
                    onDelete={handleDeleteReview}
                />
            ))}
        </div>
    );
}

export default ProductReviews;