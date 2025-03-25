// src/pages/Login/KakaoCallback.tsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { kakaoLogin } from '../../services/api/modules/auth';
import { saveAuthData, logout } from '../../utils/api/authUtils';

// 로딩 컨테이너
const LoadingContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: white;
`;

// 로고 이미지
const LogoImage = styled.div`
  width: 100px;
  height: 100px;
  background-image: url('/tajo-logo.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-bottom: 20px;
`;

// 로딩 텍스트
const LoadingText = styled.p`
  font-size: 18px;
  margin-top: 20px;
  font-family: 'Noto Sans KR', sans-serif;
`;

// 로딩 애니메이션
const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-left-color: #09f;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

/**
 * 카카오 로그인 콜백 처리 컴포넌트
 * 리다이렉트된 인가 코드를 받아 처리하고 로그인 진행
 */
const KakaoCallback: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const requestSentRef = useRef(false);
  const navigationTimeoutRef = useRef<number | null>(null);

  // 홈 페이지로 리다이렉션 함수
  const redirectToHome = () => {
    try {
      console.log('홈으로 리다이렉트 시도...');
      navigate('/main', {
        replace: true,
        state: { showToast: true, message: '로그인에 성공하였습니다.' },
      });

      // 리다이렉션 실패 감지를 위한 타임아웃 설정
      navigationTimeoutRef.current = window.setTimeout(() => {
        // 현재 경로가 여전히 /auth/kakao/callback 또는 /auth/kakao인 경우
        if (location.pathname.includes('/auth/kakao')) {
          console.error('홈 페이지 리다이렉션 실패, 로그아웃 처리');
          logout();
          setError('홈 페이지로 이동하지 못했습니다. 다시 로그인해주세요.');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
        }
      }, 3000);
    } catch (error) {
      console.error('리다이렉트 오류:', error);
      logout();
      setError('리다이렉트 중 오류가 발생했습니다. 다시 로그인해주세요.');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    }
  };

  // 컴포넌트 언마운트 시 타임아웃 정리
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // 이미 요청을 보냈다면 중복 실행 방지
    if (requestSentRef.current) return;

    // 인가 코드 추출
    const code = new URLSearchParams(location.search).get('code');
    console.log('인가 코드:', code);

    if (!code) {
      setError('인가 코드를 찾을 수 없습니다.');
      setLoading(false);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
      return;
    }

    // 이미 처리된 코드인지 확인
    const processedCode = sessionStorage.getItem('processed_kakao_code');
    if (processedCode === code) {
      console.log('이미 처리된 코드입니다. 홈으로 리다이렉트합니다.');
      redirectToHome();
      return;
    }

    console.log('인가 코드 받음, 백엔드로 전송 중...');
    requestSentRef.current = true;

    // API 호출로 로그인 처리
    kakaoLogin(code)
      .then(response => {
        console.log('로그인 응답:', response);

        if (response.success) {
          // 처리 성공 시 코드 저장
          sessionStorage.setItem('processed_kakao_code', code);

          // 토큰 저장 (JWT만 저장하고 나머지 정보는 필요시 JWT에서 추출)
          const { accessToken } = response.data;
          saveAuthData(accessToken);

          console.log('로그인 정보 저장 완료');

          // 홈 페이지로 리다이렉트
          setTimeout(redirectToHome, 1000);
        } else {
          throw new Error(response.message || '로그인 처리 중 오류가 발생했습니다.');
        }
      })
      .catch((err: any) => {
        console.error('카카오 로그인 오류:', err);

        let errorMessage = '로그인 처리 중 오류가 발생했습니다.';

        if (err.response) {
          console.error('응답 상태:', err.response.status);
          console.error('응답 데이터:', err.response.data);

          // 카카오 인증 코드 오류인 경우 명확한 메시지 표시
          if (err.response.data?.error_code === 'KOE320') {
            errorMessage = '인증 코드가 만료되었거나 이미 사용되었습니다. 다시 로그인해 주세요.';
          } else {
            // 백엔드에서 보내는 오류 메시지가 있다면 그것을 표시
            errorMessage =
              err.response.data?.message ||
              err.response.data?.error ||
              '로그인 처리 중 오류가 발생했습니다.';
          }
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);

        // 로그아웃 처리 후 로그인 페이지로 이동
        logout();
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate, location.pathname, location.search]);

  return (
    <LoadingContainer>
      <LogoImage />
      <Spinner />
      {error ? (
        <LoadingText>{error}</LoadingText>
      ) : (
        <LoadingText>로그인 처리 중입니다...</LoadingText>
      )}
    </LoadingContainer>
  );
};

export default KakaoCallback;
