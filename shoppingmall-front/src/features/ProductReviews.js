import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReviewDetail from "./ReviewDetail";
import axios from "axios";
import "../css/reviewButton.css";

function ProductReviews({ productNo }) {

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderItemNo, setOrderItemNo] = useState(0);
    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filtered, setFiltered] = useState("latest");
    const pageSize = 10;
    
    // 리뷰 삭제
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

    // 리뷰 정렬 및 불러오기
    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = {};
                if (filtered === "co-mate") {
                    if (!token) {
                        alert("Co-mate 필터는 로그인이 필요합니다.");
                        setLoading(false);
                        return;
                    }
                    headers["Authorization"] = `Bearer ${token}`;
                }
                const response = await axios.get(`http://localhost:8080/api/products/${productNo}/reviewPages`, {
                    params: {
                        page,
                        size: pageSize,
                        filterType: filtered, // latest / oldest / co-mate
                    },
                    headers,
                });
                setReviews(response.data.content);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error("리뷰 목록을 불러오는데 실패했습니다:", error);
            } finally {
                setLoading(false);
            }

        };

        fetchReviews();
    }, [productNo, page, filtered]);

    // 주문 이력 불러오기
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
                    <button type="button" className="filter-latest" onClick={() => {
                        setFiltered("latest");
                        setPage(0);
                    }}>최신순</button>
                    <p className="filter-bar"> | </p>
                    <button type="button" className="filter-oldest" onClick={() => {
                        setFiltered("oldest");
                        setPage(0);
                    }}>오래된 순</button>
                    <p className="filter-bar"> | </p>
                    <button type="button" className="filter-co-mate" onClick={() => {
                        setFiltered("co-mate");
                        setPage(0);
                    }}>Co-mate</button>
                </div>
                <button
                    className="review-btn"
                    onClick={() => getOrerItemNo()}
                >리뷰쓰기 ✎</button>
            </div>
            {reviews.map((review) => (
                <ReviewDetail
                    key={review.reviewNo}
                    reviewData={review}
                    onDelete={handleDeleteReview}
                    productNo={productNo}
                />
            ))}
            <div className="pagination" style={{ textAlign: "center", margin: "20px 0" }}>
                <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                >
                    이전
                </button>
                <span style={{ margin: "0 10px" }}>
                    {page + 1} / {totalPages || 1}
                </span>
                <button
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                >
                    다음
                </button>
            </div>
        </div>
    );
}

export default ProductReviews;