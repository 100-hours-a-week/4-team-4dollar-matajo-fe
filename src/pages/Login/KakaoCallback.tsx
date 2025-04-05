// src/pages/Login/KakaoCallback.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { kakaoLogin } from '../../services/api/modules/auth';
import { saveToken } from '../../utils/api/authUtils';

/**
 * 카카오 로그인 콜백 처리 컴포넌트
 * URL의 인가 코드를 추출하여 서버에 전송하고, 응답으로 받은 토큰을 저장
 */
const KakaoCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const lastRequestTimeRef = useRef<number>(0);
  const REQUEST_INTERVAL = 500; // 0.5초 간격으로 요청 제한

  useEffect(() => {
    // 요청 간격 제한 확인
    const now = Date.now();
    if (now - lastRequestTimeRef.current < REQUEST_INTERVAL) {
      return;
    }
    lastRequestTimeRef.current = now;
    const processKakaoLogin = async () => {
      try {
        console.log('카카오 콜백 처리 시작');
        setIsLoading(true);

        // URL에서 인가 코드 추출
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');

        // 인가 코드가 없는 경우 처리
        if (!code) {
          console.error('인가 코드가 없습니다.');
          setError('로그인에 필요한 인가 코드가 없습니다.');
          setIsLoading(false);
          return;
        }

        console.log('인가 코드 추출 성공:', code.substring(0, 10) + '...');

        // 카카오 로그인 API 호출
        const response = await kakaoLogin(code);

        // 로그인 성공 시 처리
        if (response.success && response.data.accessToken) {
          console.log('카카오 로그인 성공');

          // accessToken만 저장
          saveToken(response.data.accessToken);

          // 메인 페이지로 리디렉션
          const returnPath = sessionStorage.getItem('returnPath') || '/';
          sessionStorage.removeItem('returnPath');
          navigate(returnPath, { replace: true });
        } else {
          // 로그인 실패 시 처리
          console.error('카카오 로그인 실패:', response.message);
          setError(response.message || '로그인 처리 중 오류가 발생했습니다.');
        }
      } catch (error: any) {
        console.error('카카오 콜백 처리 오류:', error);
        setError('로그인 처리 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
      } finally {
        setIsLoading(false);
      }
    };

    processKakaoLogin();
  }, [location]);

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <img src="/tajo-logo.png" alt="Logo" className="w-20 h-20 mb-5" />
        <div className="text-lg">로그인 처리 중...</div>
        <div className="mt-3 text-sm text-gray-500">잠시만 기다려주세요</div>
      </div>
    );
  }

  // 오류 상태 표시
  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
        <img src="/tajo-logo.png" alt="Logo" className="w-40 h-40 mb-5" />
        <div className="text-red-500 text-center max-w-xs">
          <div className="font-bold mb-2">로그인 오류</div>
          <div>{error}</div>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="mt-5 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    );
  }

  // 기본 상태 (보통 표시되지 않음)
  return (
    <div className="flex justify-center items-center h-screen flex-col">
      <img src="/tajo-logo.png" alt="Logo" className="w-20 h-20 mb-5" />
      <div className="text-lg">로그인 처리 중...</div>
    </div>
  );
};

export default KakaoCallback;
