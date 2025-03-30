// src/pages/Login/KakaoCallback.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { kakaoLogin } from '../../services/api/modules/auth';
import { saveToken } from '../../utils/api/authUtils';
import axios from 'axios';

/**
 * 카카오 로그인 콜백 처리 컴포넌트
 * URL의 인가 코드를 추출하여 서버에 전송하고, 응답으로 받은 토큰을 저장
 */
const KakaoCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // useRef를 사용하여 이미 처리 중인지 확인
  const isProcessing = useRef(false);

  useEffect(() => {
    const processKakaoLogin = async () => {
      // 이미 처리 중이면 중복 실행 방지
      if (isProcessing.current) return;
      isProcessing.current = true;

      try {
        console.log('====== 카카오 콜백 처리 시작 ======');
        console.log('현재 URL:', window.location.href);
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

        console.log('인가 코드 추출 성공:', code);
        console.log('전체 URL 파라미터:', Object.fromEntries(searchParams.entries()));

        // 카카오 로그인 API 호출 (POST 요청)
        const response = await axios.post(
          'http://43.201.83.7:8080/auth/kakao',
          { code },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          },
        );

        // 응답 구조 확인을 위한 로깅
        console.log('서버 응답:', response.data);

        // access_token으로 키 이름 수정
        if (response.data.success && response.data.data?.access_token) {
          console.log('카카오 로그인 성공');
          console.log('저장할 토큰:', response.data.data.access_token);

          saveToken(response.data.data.access_token);
          console.log('토큰 저장 후 localStorage 확인:', localStorage.getItem('accessToken'));

          const returnPath = sessionStorage.getItem('returnPath') || '/';
          sessionStorage.removeItem('returnPath');
          navigate(returnPath, { replace: true });
        } else {
          console.error('카카오 로그인 실패: 토큰이 없거나 응답이 올바르지 않습니다');
          setError('로그인 처리 중 오류가 발생했습니다.');
        }
      } catch (error: any) {
        console.error('카카오 콜백 처리 오류:', error);
        console.error('오류 상세 정보:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setError('로그인 처리 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
      } finally {
        isProcessing.current = false;
        setIsLoading(false);
      }
    };

    processKakaoLogin();
  }, [location, navigate]);

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
      <div className="flex justify-center items-center h-screen flex-col">
        <img src="/tajo-logo.png" alt="Logo" className="w-20 h-20 mb-5" />
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
