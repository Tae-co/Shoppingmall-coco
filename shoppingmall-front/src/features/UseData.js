import { useState, useEffect } from "react";
import axios from "axios";

function useData(setContent, setRating, ptagsList, setPtagsClicked, ntagsList, setNtagsClicked, setPreviewFiles) {
    const [loading, setLoading] = useState(false);

    const loadData = async (reviewNo) => {

        if (!reviewNo) return;

        setLoading(true);

        try {
            const response = await axios.get(`http://localhost:8080/api/reviews/${reviewNo}`);
            const data = response.data;

            setContent(data.content);
            setRating(data.rating);

            const goodTagNames = (data.prosTags || []).map(tag => tag.tagName);
            const badTagNames = (data.consTags || []).map(tag => tag.tagName);

            const newPtagClicked = ptagsList.map((tag) => {
                return goodTagNames.includes(tag.tagName);
            });

            setPtagsClicked(newPtagClicked);

            const newNtagClicked = ntagsList.map((tag) => {
                return badTagNames.includes(tag.tagName);
            })
            setNtagsClicked(newNtagClicked);

            if (data.reviewImages && data.reviewImages.length > 0) {
                const loadedImages = data.reviewImages.map(imgObject => ({
                    id: crypto.randomUUID(),
                    url: imgObject.imageUrl,
                    file: null
                }));

                setPreviewFiles(loadedImages);
            }

        } catch (error) {
            console.error("리뷰 데이터를 불러오는데 실패했습니다:", error);
        } finally {
            setLoading(false);
        }

    }

    return {
        loadData,
        loading
    }
}

export default useData;