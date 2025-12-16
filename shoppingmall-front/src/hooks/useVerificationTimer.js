import { useState, useEffect } from 'react';

const VERIFICATION_TIMEOUT = 300; // 5분

export const useVerificationTimer = () => {
  const [timer, setTimer] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const startTimer = () => {
    setTimer(VERIFICATION_TIMEOUT);
    setIsSendingCode(false);
  };

  const resetTimer = () => {
    setTimer(0);
    setIsSendingCode(false);
  };

  const formatTimer = () => {
    if (timer === 0) return '';
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return {
    timer,
    isSendingCode,
    setIsSendingCode,
    startTimer,
    resetTimer,
    formatTimer,
    isTimerActive: timer > 0,
  };
};

