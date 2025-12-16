import { useState } from 'react'


function useStarRating(initScore = 0) {
    const [clicked, setClicked] = useState([false, false, false, false, false]); // 별 초기 상태
    const [starTotal, setStar] = useState(initScore); // 별 점수 초기 상태

    const starArray = [1, 2, 3, 4, 5]; // 별 인덱스 

    const starScore = index => {
        let stars = [...starArray];

        for (let i = 0; i < 5; i++) {
            stars[i] = i <= index;
        }
        setClicked(stars);

        let total = index + 1;
        setStar(total);
    }

    const setRating = (data) => {
        starScore(data - 1);
    }

    return {
        starTotal,
        clicked,
        starScore,
        starArray,
        setRating,
    }
};


export default useStarRating;