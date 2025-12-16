import axios from "axios";
import { storage, STORAGE_KEYS } from "../utils/api";
import { useState } from "react";

function useSubmit(
    ptagsList,
    ntagsList,
    ptagsClicked,
    ntagsClicked,
    content,
    starTotal,
    previewFiles,
    navigate,
    orderItemNo,
    reviewNo

) {
    const [submitting, setSubmitting] = useState(false);
    const handleSubmit = async (event) => {

        event.preventDefault();
        if (submitting) return;
        setSubmitting(true);

        const formData = new FormData();
        const positiveTags = ptagsList.filter((tag, index) => ptagsClicked[index]);
        const negativeTags = ntagsList.filter((tag, index) => ntagsClicked[index]);

        if (content.length < 500) {
            window.alert("500자 이상 작성해주세요!");
            return;
        } else if (starTotal < 1) {
            window.alert("별점을 눌러주세요!");
            return;
        } else if (starTotal < 3 && negativeTags.length == 0) {
            window.alert("필수 태그를 눌러주세요!")
            return;
        } else if (positiveTags.length == 0) {
            window.alert("태그를 눌러주세요!")
            return;
        }

        if (!reviewNo && !orderItemNo) {
            window.alert("리뷰를 작성할 구매 내역이 없습니다. (orderItemNo 누락)");
            return;
        }

        const allSelectedTags = [...positiveTags, ...negativeTags];
        const tagIds = allSelectedTags.map(tag => tag.tagNo);

        const orderItemNoNum = Number(orderItemNo);

        const reviewDto = {
            rating: starTotal,
            content: content,
            tagIds: tagIds,
            orderItemNo: reviewNo ? null : orderItemNoNum
        }

        formData.append(
            "reviewDTO", new Blob([JSON.stringify(reviewDto)], { type: "application/json" })
        )
        if (previewFiles && previewFiles.length > 0) {
            previewFiles.forEach((pf) => {
                if (pf.file) {
                    formData.append("files", pf.file);
                }
            })
        }

        try {
            if (reviewNo) {
                // 리뷰 수정 (인증 필요)
                const token = storage.get(STORAGE_KEYS.TOKEN);
                const headers = { 'Content-Type': 'multipart/form-data' };

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                await axios.put(`http://13.231.28.89:18080/api/reviews/${reviewNo}`, formData, { headers });
                alert("리뷰가 수정되었습니다.");
            } else {
                // 리뷰 작성 (인증 필요)
                const token = storage.get(STORAGE_KEYS.TOKEN);
                const headers = { 'Content-Type': 'multipart/form-data' };

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                await axios.post('http://13.231.28.89:18080/api/reviews', formData, { headers });
                alert("리뷰가 등록되었습니다.");
            }
            navigate('/'); // (TODO: 성공 후 상품 상세 페이지로 이동)
        } catch (error) {
            console.error("리뷰 등록/수정 실패:", error);
            alert(error.message || "리뷰 처리 중 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }

    };

    return {
        handleSubmit, submitting
    }
}

export default useSubmit;