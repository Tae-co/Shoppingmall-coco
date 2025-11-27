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
    const [filtered, setFiltered] = useState("latest");
    const [coMateReviews, setCoMateReviews] = useState([]);

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
            const token = localStorage.getItem("token");
            if (!token) {
                alert("로그인이 필요합니다.");
                return;
            }
            const response = await axios.get(`http://localhost:8080/api/reviews/${productNo}/getOrderItemNo`, { headers: { Authorization: `Bearer ${token}` } });
            const orderItemNoFromApi = response.data; 
            setOrderItemNo(orderItemNoFromApi);
            return navigate(`/reviews/${orderItemNoFromApi}`);
        } catch (error) {
            console.log("orderItemNo를 불러오지 못 했습니다.", error);
            const msg = error.response?.data?.message
                || "주문 이력이 없거나 오류가 발생했습니다.";
            alert(msg);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchComate = async () => {
            if (filtered !== "co-mate") return;

            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    alert("로그인이 필요합니다.");
                    return;
                }
                const response = await axios.get(`http://localhost:8080/api/products/${productNo}/reviews/comate`, { headers: { Authorization: `Bearer ${token}` } });
                setCoMateReviews(response.data);
            } catch (error) {
                console.log("co-mate 필터 적용실패", error);
            }
        }
        fetchComate();
    }, [filtered, productNo]);

    let sortReviews;
    if (filtered === "co-mate") {
        sortReviews = coMateReviews;
    } else {
        sortReviews = [...reviews];
        if (filtered === "latest") {
            sortReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (filtered === "oldest") {
            sortReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
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
                <div className="filter-container">
                    <button type="button" className="filter-latest" onClick={() => setFiltered("latest")}>최신순</button>
                    <p className="filter-bar"> | </p>
                    <button type="button" className="filter-oldest" onClick={() => setFiltered("oldest")}>오래된 순</button>
                    <p className="filter-bar"> | </p>
                    <button type="button" className="filter-co-mate" onClick={() => setFiltered("co-mate")}>Co-mate</button>
                </div>
                <button
                    className="review-btn"
                    onClick={() => getOrerItemNo()}
                >리뷰쓰기 ✎</button>
            </div>
            {sortReviews.map((review) => (
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