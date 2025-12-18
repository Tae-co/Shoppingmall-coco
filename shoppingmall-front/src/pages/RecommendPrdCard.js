import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const RecommendPrdCard = ({
    productNo,
    productImg,
    productName,
    productPrice
}) => {
    const textRef = useRef(null);
    const [isOverflow, setIsOverflow] = useState(false);

    useEffect(() => {
        const el = textRef.current;
        if (el && el.scrollWidth > el.clientWidth) {
            setIsOverflow(true);
        }
    }, []);

    return (
        <div className="recommend_prd_wrapper">
            <Link to={`/products/${productNo}`} className="recommend_prd_link">
                <img src={productImg} className="recommend_prd_img" />
                <div className="prd_info">
                    <div className={`recommend_prd_name ${isOverflow ? 'overflow' : ''}`}>
                        <span ref={textRef} className="prd_name_text">
                            {productName}
                        </span>
                    </div>
                    <div className="recommend_prd_price">{productPrice}원</div>
                </div>
            </Link>
        </div>
    );
};

export default RecommendPrdCard;
