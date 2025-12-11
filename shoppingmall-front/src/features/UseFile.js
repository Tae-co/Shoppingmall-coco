import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
function useFile() {
    const ref = useRef(null);
    const [previewFiles, setPreviewFiles] = useState([]); // {id, url} 객체 배열
    const [fileError, setFileError] = useState("");

    const processFile = (file) => {

        return new Promise((resolve, reject) => {

            const reader = new FileReader();

            reader.onload = (event) => {
                resolve({
                    id: uuidv4(), // 고유 ID
                    url: event.target.result, // 미리보기 URL
                    file: file
                });
            };
            // 파일이 성공적으로 입력이 되었을 때 id, url, file를 만든다.

            // 에러가 발생시 error 메시지 만든다.
            reader.onerror = (event) => {
                reject(new Error('파일 읽기 실패'));
            }

            //파일을 읽는 작업 실행 
            reader.readAsDataURL(file);


        });
    };

    const handleFileChange = async (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length === 0) return;

        const currentCount = previewFiles.length;
        const remainingSlots = 5 - currentCount;

        if (newFiles.length > remainingSlots) {
            setFileError(`최대 5개까지만 첨부할 수 있습니다. ${remainingSlots}개만 추가됩니다.`);
            newFiles.splice(remainingSlots);
        } else {
            setFileError("");
        }
        const newFileObjects = await Promise.all(newFiles.map(processFile));
        setPreviewFiles(prevFiles => [...prevFiles, ...newFileObjects]);

        e.target.value = null;
    };

    const handleDelete = (idToDelete) => {
        setPreviewFiles(prevFiles =>
            prevFiles.filter(file => file.id !== idToDelete)
        );
        if (previewFiles.length - 1 < 5) {
            setFileError("");
        }
    };

    const handleAddImageClick = () => {
        if (previewFiles.length < 5) {
            setFileError("");
            ref.current.click();
        } else {
            setFileError("최대 5개까지만 첨부할 수 있습니다.");
        }
    };

    return {
        previewFiles,
        setPreviewFiles,
        handleDelete,
        handleAddImageClick,
        handleFileChange,
        ref,
        fileError
    }

}

export default useFile;