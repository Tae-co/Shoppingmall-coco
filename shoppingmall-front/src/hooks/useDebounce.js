import { useEffect, useState } from 'react';

/* 디바운스 (Debounce) API 과부화 방지 */
export default function useDebounde(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounced(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debounced;
}