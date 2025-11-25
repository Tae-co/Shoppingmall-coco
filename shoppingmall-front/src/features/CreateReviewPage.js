import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import Review from "../pages/Review";
import axios from "axios";

function CreateReviewwPage() {

    const { orderItemNo } = useParams();
    const navigate = useNavigate();
    const [isVaild, setVaild] = useState(null);

    useEffect(() => {
        async function checkOrderItem() {
            try {
                const response = await axios.get(`http://localhost:8080/orderItems/${orderItemNo}/check`);
                setVaild(response.status === 200);
                console.log('응답 status:', response.status);
            } catch(error) {
                console.log('catch:', error.response?.status, error);
                setVaild(false)
            }
        }
        checkOrderItem();
    }, [orderItemNo])

    if (isVaild == null) {
        return <div>로딩중</div>
    }

    if (isVaild == false) {
        return (<div>잘못된 주문 번호입니다.<button onClick={() => navigate(-1)}>뒤로가기</button></div>);
    }
     return <Review />
}

export default CreateReviewwPage