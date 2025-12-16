import React from 'react';
import { Link } from 'react-router-dom';

const RecommendPrdCard = ({
    productNo,
    productImg,
    productName,
    productPrice
}) => {
    return (
        <div className="recommend_prd_wrapper">
        <Link to={`/products/${productNo}`}>
            <img src={productImg} className="recommend_prd_img"/>
            <div className="prd_info">
                <div className="recommend_prd_name">{productName}</div>
                <div className="recommend_prd_price">{productPrice}원</div>
            </div>
        </Link>
        </div>
    );
}

export default RecommendPrdCard;
