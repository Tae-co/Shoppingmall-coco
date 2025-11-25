import react, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import greyStar from '../images/greyStar.svg'
import yellowStar from '../images/yellowStar.svg'
import addImg from '../images/addImg.svg'
import axios from "axios";
import UseStarRating from '../features/UseStarRating.js'
import UseTag from '../features/UseTag.js'
import usefile from '../features/UseFile.js'
import UseSubmut from '../features/UseSubmit.js'
import UseData from '../features/UseData.js'
import '../css/review.css'
function UpdateReview() {

    const { reviewNo, orderItemNo } = useParams();
    const navigate = useNavigate();

    const reviewGuide = `1. 제품의 '첫인상'과 '사용감'을 자세히 알려주세요

    제형/질감: 묽은 물 토너, 쫀쫀한 콧물 제형, 꾸덕한 크림, 가벼운 젤 타입 등
    발림성/흡수력: 부드럽게 발린다, 흡수가 빠르다, 겉도는 느낌이다, 백탁 현상이 있다/없다
    향: 무향, 은은한 꽃향, 상큼한 시트러스 향, 호불호 갈릴 듯한 OO 향
    색상 (색조): 화면보다 핑크/오렌지 기가 돈다, 생각보다 펄이 자글자글하다
    용기/패키징: 펌프형이라 편하다, 스패출러가 내장되어 있다, 입구가 좁아 양 조절이 어렵다

2. '그래서, 효과는 어땠나요?' (사용 후기)

    사용 기간: "방금 1회 사용해봤어요" (첫인상 리뷰) vs "2주간 아침저녁으로 꾸준히 썼어요" (효과 리뷰)
    느낀 효과 (장점):
        (스킨케어) "속건조가 잡혔어요", "트러블이 확실히 진정됐어요", "피부결이 매끈해졌어요"
        (메이크업) "다크닝 없이 6시간 지속됐어요", "끼임이나 무너짐이 예뻐요", "묻어남이 적어요"
    아쉬운 점 (단점): "눈 시림이 약간 있었어요", "제 피부엔 너무 유분기가 돌았어요", "향이 너무 강해요"

3. '요약'과 '추천'으로 마무리하기

    바쁜 분들을 위해 리뷰를 요약해주세요.
    장점: (예: 빠른 진정, 좋은 성분)
    단점: (예: 비싼 가격, 작은 용량)
    재구매 의사: O / X / △ (고민됨)
    이런 분께 추천해요: "저처럼 트러블 자주 나는 지성 피부에게 추천!", "자연스러운 톤업 크림 찾는 분들께 비추천"

4. 사진 첨부는 큰 도움이 됩니다!

    제형 샷: 손등이나 손바닥에 덜어 질감을 보여주세요.
    발색 샷 (색조): 팔목이나 입술에 발색한 사진 (실제 색감과 비슷하게)
    Before & After: 사용 전/후 피부 상태나 메이크업 비교 샷
    사용 팁: 메이크업 직후 vs 5시간 후 지속력 비교 샷
    `;

    const [tags, setTags] = useState([]);
    const [loadingTags, setLoadingTags] = useState(true);

    const [content, setContent] = useState(""); // 리뷰 텍스트를 위한 state

    const { starTotal, clicked, starScore, starArray, setRating } = UseStarRating(0);
    const { ptagsClicked, ntagsClicked, pWarnMsg, nWarnMsg, ptoggleActive, ntoggleActive, setPtagsClicked, setNtagsClicked, ptagsList, ntagsList } = UseTag(tags);
    const { previewFiles, setPreviewFiles, handleDelete, handleAddImageClick, handleFileChange, ref, fileError } = usefile();
    const { handleSubmit } = UseSubmut(
        ptagsList, ntagsList,
        ptagsClicked, ntagsClicked,
        content,
        starTotal,
        previewFiles, navigate,
        null,
        reviewNo
    )
    const { loadData, loading } = UseData(
        setContent, setRating,
        ptagsList, setPtagsClicked,
        ntagsList, setNtagsClicked,
        setPreviewFiles
    );

    useEffect(() => {
        const loadAllTags = async () => {
            setLoadingTags(true);
            try {
                const response = await axios.get(`http://localhost:8080/api/tags`);
                setTags(response.data);
            } catch (error) {
                console.error("태그 목록 로딩 실패:", error);
            }
            setLoadingTags(false);
        }
        loadAllTags();
    }, [])

    useEffect(() => {

        if (tags.length > 0 && reviewNo) {
            loadData(reviewNo);
        }
    }, [tags, reviewNo]);

    // 별 1~2개 일 떄 경고 알림

    const handleCancel = () => {
        window.alert("정말 취소 하시겠습니까?")
        navigate(`/`);
    };

    const warnStarTags = (starTotal) => {
        return 0 < starTotal && starTotal <= 2 ? "별점이 낮을 경우, 아쉬운 점을 최소 1개 이상 선택해주세요." : " ";
    }

    console.log("이미지", previewFiles);

    return (
        <div className="reviewBox">
            <div className="reviewMain">
                <form className="reviewForm" onSubmit={handleSubmit}>
                    <div className="title">
                        <h1>리뷰 수정</h1>
                        <h4>제품을 사용해보신 경험을 공유해주세요</h4>
                    </div>

                    <div className="starContainer">
                        {/* 별을 누를 때 마다 노란 색으로 채워야 됨, 별이 얼마나 채워졌는지 확인해야함 */}
                        <h5>별점을 선택해주세요.</h5>
                        <div>
                            {starArray.map((stars, i) => (
                                <img
                                    key={i}
                                    onClick={() => starScore(i)}
                                    src={clicked[i] ? yellowStar : greyStar}
                                />
                            ))}
                            {console.log(clicked)}
                            별점 {starTotal}
                        </div>
                    </div>

                    <div className="tagBox">
                        <h5 className="tagsTitle">어떤 점이 좋았나요? (복수 선택가능)</h5>
                        <br /><div className="warnText">{pWarnMsg}</div>
                        {/* 버튼 형식의 태그  */}
                        <div className="tagContainer">
                            {ptagsList.map((tag, i) => (
                                <button type="button" className={"tagBtn" + (ptagsClicked[i] ? "active" : " ")} key={tag.tagNo} value={tag.tagName} onClick={() => ptoggleActive(i)}>{tag.tagName}</button>
                            ))}
                        </div>
                    </div>

                    <div className="tagBox">
                        {/* 별점이 1~2개 일 때 필수로 선택해야 한다는 문구 표시 */}
                        <h5 className="tagsTitle">어떤 점이 아쉬웠나요? (복수 선택가능)</h5>
                        <br /><div className="warnText">{nWarnMsg}&nbsp;&nbsp;</div>
                        <div className="warnText">{warnStarTags(starTotal)}</div>


                        {/* 버튼 형식의 태그  */}
                        <div className="tagContainer">
                            {ntagsList.map((tag, i) => (
                                <button type="button" className={"tagBtn" + (ntagsClicked[i] ? "active" : " ")} key={tag.tagNo} value={tag.tagName} onClick={() => ntoggleActive(i)}>{tag.tagName}</button>
                            ))} </div>
                    </div>

                    <div className="textBox">
                        {/* 최소 글자 수 못 넘겼을 때 나오는 글 표시 필요 */}
                        <label htmlFor="postText">
                            <h5>리뷰를 작성해주세요</h5>
                        </label>
                        <div>
                            <textarea
                                className="textarea"
                                id="postText"
                                rows={30}
                                placeholder="자세한 리뷰는 다른 분들께 큰 도움이 됩니다."
                                value={content}
                                minLength={1000}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <div>
                            * 리뷰 가이드 라인!
                        </div> <br />
                        <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                            {reviewGuide}
                        </div>
                    </div>



                    <div className="fileBox">
                        <div className="scrollable-container">
                            {/* 이미지 미리보기 컴포넌트 리스트 */}
                            {previewFiles.map(preview => (
                                <div key={preview.id} className="preview-component">
                                    <img
                                        src={preview.file ? URL.createObjectURL(preview.file) : `http://localhost:8080/images/${preview.url}`}
                                        alt="미리보기"
                                        className="preview-image"
                                    />
                                    {/* 삭제 버튼 */}
                                    <button type="button"
                                        onClick={() => handleDelete(preview.id)}
                                        className="delete-button"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}

                            {/* 이미지 추가 버튼 (5개 미만일 때만 보임) */}
                            {previewFiles.length < 5 && (
                                <div className="addImgBtn" onClick={handleAddImageClick}>
                                    <span>사진 추가 ({previewFiles.length}/5)</span>
                                    <img src={addImg} />
                                </div>
                            )}
                        </div>

                        <input
                            hidden
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={ref}
                        />

                        {fileError && <div className="fileError">{fileError}</div>}

                        <div className="fileInfo" >
                            <h5>이미지:JPG,PNG,GIF</h5>
                        </div>

                    </div>

                    <div className="buttonBox">
                        {/* 취소 및 리뷰등록 버튼 바꾸기  */}
                        {/* 취소 선택시 상품 페이지로 */}
                        {/* 리뷰 등록 선택시 리뷰 등록 후 상품 페이지로 */}
                        <button type="button" onClick={handleCancel}>취소</button>
                        <button type="submit">리뷰수정</button>
                    </div>
                </form >
            </div>
        </div >
    )
}

export default UpdateReview;