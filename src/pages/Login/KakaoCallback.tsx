import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { decodeJWT } from '../../utils/formatting/decodeJWT';
import { kakaoLogin } from '../../services/api/modules/auth';

const KakaoCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isProcessing = useRef<boolean>(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 토큰 저장 함수를 컴포넌트 내부에 직접 구현
  const saveToken = (token: string) => {
    try {
      localStorage.setItem('accessToken', token);
      // JWT 디코딩 확인 (옵션)
      const decoded = decodeJWT(token);
      if (!decoded) {
        console.warn('토큰 디코딩 실패');
      }
    } catch (error) {
      console.error('토큰 저장 실패:', error);
      throw error;
    }
  };

  useEffect(() => {
    const processKakaoLogin = async () => {
      if (isProcessing.current) return;
      isProcessing.current = true;
      setIsLoading(true);

      try {
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');

        if (!code) {
          throw new Error('인가 코드가 없습니다.');
        }

        const response = await kakaoLogin(code);

        if (response.success && response.data?.accessToken) {
          console.log('카카오 로그인 성공');

          // 토큰만 저장
          saveToken(response.data.accessToken);

          // 저장된 토큰 확인 로그
          console.log('토큰 저장 확인:', localStorage.getItem('accessToken'));

          const returnPath = sessionStorage.getItem('returnPath') || '/';
          sessionStorage.removeItem('returnPath');
          navigate(returnPath, { replace: true });
        } else {
          throw new Error('토큰이 없거나 응답이 올바르지 않습니다');
        }
      } catch (error: any) {
        console.error('카카오 콜백 처리 오류:', error);
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
