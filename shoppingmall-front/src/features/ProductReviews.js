import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReviewDetail from "./ReviewDetail";
import axios from "axios";
import { getStoredMemberId } from "../utils/api";
import "../css/reviewButton.css";

function ProductReviews({ productNo }) {

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderItemNo, setOrderItemNo] = useState(0);
    const navigate = useNavigate();

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

    const getOrerItemNo = async () => {
        setLoading(true);
        try {
            const memberId = await getStoredMemberId();
            const response = await axios.get(`http://localhost:8080/api/reviews/${productNo}/getOrderItemNo/${memberId}`);
            setOrderItemNo(response.data);
            return navigate(`/reviews/:orderItemNo`);
        } catch (error) {
            console.log("orderItemNo를 불러오지 못 했습니다.", error);
            const msg = error.response?.data?.message
                || "주문 이력이 없거나 오류가 발생했습니다.";
            alert(msg);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>리뷰를 불러오는 중...</div>;
    }

    if (reviews.length === 0) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>작성된 리뷰가 없습니다.</div>;
    }

    return (
        <div className="review-list-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div className="review-header">
                <h2 className="review-title">리뷰 (총 {reviews.length}개)</h2>
                <button
                    className="review-btn"
                    onClick={() => getOrerItemNo()}
                >리뷰쓰기 ✎</button>
            </div>
            {reviews.map((review) => (
                // 4. 각 리뷰 데이터를 'reviewData'라는 prop으로 전달
                // 'key'는 React가 각 항목을 구별하기 위해 필수입니다.
                <ReviewDetail
                    key={review.reviewNo}
                    reviewData={review}
                    onDelete={handleDeleteReview}
                    productNo={productNo}
                />
            ))}
        </div>
    );
}

export default ProductReviews;