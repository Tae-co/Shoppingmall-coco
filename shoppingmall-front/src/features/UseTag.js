import { useState, useMemo, useEffect } from "react";

function useTag(tags) {
    const ptagsList = useMemo(
        () => (tags ? tags.filter(tag => tag.tagStatus == "장점") : []), [tags]
    )

    const ntagsList = useMemo(
        () => (tags ? tags.filter(tag => tag.tagStatus == "단점") : []), [tags]
    )

    const [ptagsClicked, setPtagsClicked] = useState(new Array(ptagsList.length).fill(false));
    const [ntagsClicked, setNtagsClicked] = useState(new Array(ntagsList.length).fill(false));
    const [pWarnMsg, pSetWarnMsg] = useState("");
    const [nWarnMsg, nSetWarnMsg] = useState("");

    useEffect(() => {
        setPtagsClicked(new Array(ptagsList.length).fill(false));
        setNtagsClicked(new Array(ntagsList.length).fill(false));
    }, [ptagsList, ntagsList])

    const ptoggleActive = (indexTogle) => {

        setPtagsClicked((prevStates) => {

            const currentState = prevStates.filter(Boolean).length;
            const isAdding = !prevStates[indexTogle];

            if (isAdding && currentState >= 4) {
                pSetWarnMsg("최대 4개 까지 선택할 수 있습니다.");
                return prevStates;
            }

            pSetWarnMsg("");
            return prevStates.map((currentState, index) => {
                return indexTogle == index ? !currentState : currentState;
            })
        })
    };

    const ntoggleActive = (indexTogle) => {
        setNtagsClicked((prevStates) => {
            const currentState = prevStates.filter(Boolean).length; // true 개수
            const isAdding = !prevStates[indexTogle]// isAdding이 true면 추가 , false면 취소 

            if (isAdding && currentState >= 4) {
                nSetWarnMsg("최대 4개 까지 선택할 수 있습니다.");
                return prevStates;
            }
            nSetWarnMsg("");
            return prevStates.map((currentState, index) => {
                return indexTogle == index ? !currentState : currentState;
            })
        })
    };

    return {
        ptagsList,
        ntagsList,
        ptagsClicked,
        ntagsClicked,
        pWarnMsg,
        nWarnMsg,
        ptoggleActive,
        ntoggleActive,
        setPtagsClicked,
        setNtagsClicked
    }
}

export default useTag;