import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios";
import UpdateReview from "../pages/UpdateReview";

function CreateUpdatePage() {
    const { reviewNo } = useParams();
    const navigate = useNavigate();
    const [isVaild, setVaild] = useState(null);

    useEffect(() => {
          console.log('useEffect 진입:', reviewNo); // 첫 줄에 로깅
        async function checkOrderItem() {
            try {
                const response = await axios.get(`http://localhost:8080/review/${reviewNo}/check`);
                console.log('응답 status:', response.status);
                setVaild(response.status === 200);
                
            } catch(error) {
                console.log('catch:', error.response?.status, error);
                setVaild(false)
                
            }
            
        }
        checkOrderItem();
    }, [reviewNo])

    if (isVaild == null) {
        return <div>로딩 중...</div>;
    }

    if (isVaild == false) {
        return (<div>잘못된 주문 번호입니다.<button onClick={() => navigate(-1)}>뒤로가기</button></div>);
    }
    return <UpdateReview />
}

export default CreateUpdatePage