const API_BASE_URL = 'http://localhost:8080/api';

// 상수 정의
export const STORAGE_KEYS = {
  TOKEN: 'token',
  MEMBER: 'member',
};

// 이메일 검증 정규식
export const EMAIL_REGEX = /^[A-Za-z0-9+_.-]+@(.+)$/;

// localStorage 관리 함수
export const storage = {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`localStorage get 오류 (${key}):`, error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`localStorage set 오류 (${key}):`, error);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`localStorage remove 오류 (${key}):`, error);
    }
  },

  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('localStorage clear 오류:', error);
    }
  }
};

// JWT 토큰이 포함된 인증 헤더 생성
export const getAuthHeaders = () => {
  const token = storage.get(STORAGE_KEYS.TOKEN);
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// JWT 토큰을 포함한 인증 API 요청 처리
export const fetchWithAuth = async (url, options = {}) => {
  const headers = getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    logout();
    window.location.href = '/login';
    throw new Error('인증이 만료되었습니다.');
  }

  return response;
};

// 인증이 필요하지 않은 일반 API 요청 처리
export const fetchWithoutAuth = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
};

// 로그인 상태 확인
export const isLoggedIn = () => {
  return !!storage.get(STORAGE_KEYS.TOKEN);
};

// 로그아웃 처리 및 저장된 인증 정보 제거
export const logout = (options = {}) => {
  storage.clear();
  window.dispatchEvent(new Event('loginStatusChanged'));
  if (options.redirectTo) {
    window.location.href = options.redirectTo;
  }
};

// 로컬에 저장된 회원 정보 조회
export const getStoredMember = () => {
  try {
    const memberData = storage.get(STORAGE_KEYS.MEMBER);
    return memberData ? JSON.parse(memberData) : {};
  } catch (error) {
    console.error('저장된 회원 정보 파싱 오류:', error);
    return {};
  }
};

// 로그인 성공 후 공통 처리
const handleLoginSuccess = (data) => {
  if (data.token) {
    storage.set(STORAGE_KEYS.TOKEN, data.token);
  }
  storage.set(STORAGE_KEYS.MEMBER, JSON.stringify(data));
  window.dispatchEvent(new Event('loginStatusChanged'));
  return data;
};

// 일반 로그인 처리
export const login = async ({ memId, memPwd }) => {
  const response = await fetchWithoutAuth('/member/login', {
    method: 'POST',
    body: JSON.stringify({ memId, memPwd }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
  }

  return handleLoginSuccess(data);
};

// 카카오 로그인 처리
export const kakaoLogin = async (accessToken) => {
  const response = await fetchWithoutAuth('/member/kakao/login', {
    method: 'POST',
    body: JSON.stringify({ accessToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '카카오 로그인에 실패했습니다.');
  }

  return handleLoginSuccess(data);
};

// 네이버 로그인 처리
export const naverLogin = async (accessToken) => {
  const response = await fetchWithoutAuth('/member/naver/login', {
    method: 'POST',
    body: JSON.stringify({ accessToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '네이버 로그인에 실패했습니다.');
  }

  return handleLoginSuccess(data);
};

// 구글 로그인 처리
export const googleLogin = async (accessToken) => {
  const response = await fetchWithoutAuth('/member/google/login', {
    method: 'POST',
    body: JSON.stringify({ accessToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '구글 로그인에 실패했습니다.');
  }

  return handleLoginSuccess(data);
};

// 이메일 인증번호 전송
export const sendEmailVerificationCode = async (email) => {
  const response = await fetchWithoutAuth('/member/email/send', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || '인증번호 전송에 실패했습니다.');
  }

  return data;
};

// 이메일 인증번호 검증
export const verifyEmailCode = async (email, code) => {
  const response = await fetchWithoutAuth('/member/email/verify', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || '인증번호가 일치하지 않습니다.');
  }

  return data;
};

// 아이디 중복 확인
export const checkIdDuplicate = async (memId) => {
  const response = await fetchWithoutAuth(`/member/check-id/${memId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '중복확인 중 오류가 발생했습니다.');
  }

  return data;
};

// 닉네임 중복 확인
export const checkNicknameDuplicate = async (memNickname) => {
  const response = await fetchWithoutAuth(`/member/check-nickname/${encodeURIComponent(memNickname)}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '중복확인 중 오류가 발생했습니다.');
  }

  return data;
};

// 아이디 찾기 - 인증번호 전송
export const sendFindIdVerificationCode = async (email) => {
  const response = await fetchWithoutAuth('/member/find-id/send', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || '인증번호 전송에 실패했습니다.');
  }

  return data;
};

// 아이디 찾기 - 인증번호 검증
export const findId = async (email, code) => {
  const response = await fetchWithoutAuth('/member/find-id/verify', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || '인증번호가 일치하지 않습니다.');
  }

  return data;
};

// 비밀번호 찾기 - 인증번호 전송
export const sendResetPasswordVerificationCode = async (memId, email) => {
  const response = await fetchWithoutAuth('/member/find-password/send', {
    method: 'POST',
    body: JSON.stringify({ memId, email }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || '인증번호 전송에 실패했습니다.');
  }

  return data;
};

// 비밀번호 재설정
export const resetPassword = async (memId, email, code, newPassword) => {
  const response = await fetchWithoutAuth('/member/reset-password', {
    method: 'POST',
    body: JSON.stringify({ memId, email, code, newPassword }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || '비밀번호 재설정에 실패했습니다.');
  }

  return data;
};

// 회원가입
export const signup = async (signupData) => {
  const response = await fetchWithoutAuth('/member/signup', {
    method: 'POST',
    body: JSON.stringify(signupData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '회원가입 중 오류가 발생했습니다.');
  }

  return data;
};

// 회원 정보 수정
export const updateMember = async (updateData) => {
  const response = await fetchWithAuth('/member/update', {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '정보 입력에 실패했습니다.');
  }

  return data;
};

// 이메일 형식 검증
export const validateEmail = (email) => {
  return EMAIL_REGEX.test(email);
};

// 현재 로그인한 회원 정보 조회 (백엔드 API 호출)
export const getCurrentMember = async () => {
  const response = await fetchWithAuth('/member/me');

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '회원 정보 조회에 실패했습니다.');
  }

  // localStorage에 최신 정보 업데이트 (이벤트는 발생시키지 않음 - 무한 루프 방지)
  storage.set(STORAGE_KEYS.MEMBER, JSON.stringify(data));

  return data;
};

// memberId 조회
export function getStoredMemberId() {
  try {
    const memberStr = localStorage.getItem('member');
    if (!memberStr) return null;
    const member = JSON.parse(memberStr);
    return member.memNo; // 혹은 .memberId, .id 등 실제 DB pk 컬럼명에 맞추기!
  } catch(e) {
    return null;
  }
}

// 비밀번호 변경
export const changePassword = async (currentPassword, newPassword) => {
  const response = await fetchWithAuth('/member/change-password', {
    method: 'PUT',
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '비밀번호 변경에 실패했습니다.');
  }

  return data;
};

// 계정 삭제
export const deleteAccount = async (currentPassword) => {
  const response = await fetchWithAuth('/member/delete', {
    method: 'DELETE',
    body: JSON.stringify({ currentPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '계정 삭제에 실패했습니다.');
  }

  return data;
};

