// src/pages/Login/KakaoCallback.tsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { kakaoLogin } from '../../services/api/modules/auth';
import { saveKakaoLoginData, logout } from '../../utils/api/authUtils';
import { KAKAO_AUTH } from '../../constants/api';
import { decodeJWT } from '../../utils/formatting/decodeJWT';

// 스타일 컴포넌트
const LoadingContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: white;
`;

const LoadingText = styled.p`
  font-size: 18px;
  margin-top: 20px;
  font-family: 'Noto Sans KR', sans-serif;
`;

const ErrorText = styled.p`
  font-size: 16px;
  color: #e74c3c;
  margin-top: 10px;
  max-width: 80%;
  text-align: center;
  font-family: 'Noto Sans KR', sans-serif;
`;

const LogoImage = styled.div`
  width: 100px;
  height: 100px;
  background-image: url('/tajo-logo.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-bottom: 20px;
`;

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

// 개발 모드에서만 표시할 디버깅 컴포넌트
const DebugContainer = styled.div`
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  max-width: 90%;
  max-height: 200px;
  overflow: auto;
  font-family: monospace;
  font-size: 12px;
  color: #333;
`;

/**
 * 카카오 로그인 콜백 처리 컴포넌트
 */
const KakaoCallback: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null); // 디버깅 정보 상태
  const navigate = useNavigate();
  const location = useLocation();
  const requestSentRef = useRef(false); // 요청 전송 여부를 추적하는 ref
  const navigationTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  // 로그인 후 홈 페이지로 리다이렉션 함수
  const redirectToHome = () => {
    try {
      console.log('홈으로 리다이렉트 시도...');
      navigate('/main', {
        replace: true,
        state: { showToast: true, message: '로그인에 성공하였습니다.' },
      });

      // 리다이렉션 실패를 감지하기 위한 타임아웃 설정
      navigationTimeoutRef.current = window.setTimeout(() => {
        // 현재 경로가 여전히 /auth/kakao 인 경우
        if (location.pathname.includes('/auth/kakao')) {
          console.error('홈 페이지 리다이렉션 실패, 로그아웃 처리');
          logout(); // 로그아웃 처리
          setError('홈 페이지로 이동하지 못했습니다. 다시 로그인해주세요.');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
        }
      }, 3000); // 3초 타임아웃
    } catch (error) {
      console.error('리다이렉트 오류:', error);
      logout(); // 오류 발생 시 로그아웃
      setError('리다이렉트 중 오류가 발생했습니다. 다시 로그인해주세요.');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    }
  };

  useEffect(() => {
    // 컴포넌트 언마운트 시 타임아웃 정리
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // 이미 요청을 보냈으면 중복 요청 방지
    if (requestSentRef.current) return;

    // 인가 코드 추출
    const code = new URLSearchParams(location.search).get('code');

    // 디버깅 정보 생성
    const debugData = {
      url: location.pathname + location.search,
      codeExists: Boolean(code),
      codeLength: code ? code.length : 0,
      codePreview: code ? `${code.substring(0, 10)}...${code.substring(code.length - 10)}` : null,
      redirectUri: KAKAO_AUTH.REDIRECT_URI,
      timestamp: new Date().toISOString(),
    };

    setDebugInfo(JSON.stringify(debugData, null, 2));
    console.log('카카오 로그인 디버깅 정보:', debugData);

    if (!code) {
      console.error('인가 코드를 찾을 수 없습니다. 로그인 페이지로 리다이렉트합니다.');
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

    // 카카오 로그인 API 요청 함수
    const processKakaoLogin = async () => {
      // 중복 요청 방지
      if (requestSentRef.current) return;
      requestSentRef.current = true;

      console.log('인가 코드 받음, 백엔드로 전송 중...');

      try {
        // API 호출 및 응답 처리
        const response = await kakaoLogin(code);
        console.log('로그인 응답:', response);

        if (response.success) {
          // accessToken 확인
          if (!response.data.accessToken) {
            throw new Error('토큰이 없습니다.');
          }

          // 토큰 디코딩해보기 (디버깅용)
          // 토큰 디코딩해보기 (디버깅용)
          try {
            const decoded = decodeJWT(response.data.accessToken);
            console.log('토큰 디코딩 결과:', decoded);

            // 디버깅 정보 업데이트
            setDebugInfo(prev => {
              const currentInfo = JSON.parse(prev || '{}');
              return JSON.stringify(
                {
                  ...currentInfo,
                  tokenInfo: {
                    decoded: decoded
                      ? {
                          userId: decoded.userId,
                          role: decoded.role,
                          exp: decoded.exp,
                          // 민감 정보는 표시하지 않음
                        }
                      : 'Invalid token',
                  },
                },
                null,
                2,
              );
            });
          } catch (decodeError) {
            console.error('토큰 디코딩 실패:', decodeError);
          }

          // accessToken만 저장 (userId는 저장하지 않음)
          saveKakaoLoginData({
            accessToken: response.data.accessToken,
          });

          // 처리된 코드 저장
          sessionStorage.setItem('processed_kakao_code', code);

          // 홈 페이지로 리다이렉트
          setTimeout(redirectToHome, 1000);
        } else {
          throw new Error(response.message || '로그인 처리 중 오류가 발생했습니다.');
        }
      } catch (err: any) {
        console.error('카카오 로그인 오류:', err);

        // 네트워크 오류일 경우 재시도
        if (err.message?.includes('Network Error') && retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          requestSentRef.current = false; // 재시도를 위해 플래그 초기화

          console.log(
            `네트워크 오류로 인한 재시도 (${retryCountRef.current}/${MAX_RETRIES}) 5초 후...`,
          );
          setDebugInfo(prev => {
            const currentInfo = JSON.parse(prev || '{}');
            return JSON.stringify(
              {
                ...currentInfo,
                retrying: true,
                retryCount: retryCountRef.current,
                retryAt: new Date().toISOString(),
              },
              null,
              2,
            );
          });

          setTimeout(processKakaoLogin, 5000); // 5초 후 재시도
          return;
        }

        // 에러 상세 정보 기록
        setDebugInfo(prev => {
          const currentInfo = JSON.parse(prev || '{}');
          return JSON.stringify(
            {
              ...currentInfo,
              error: {
                message: err.message,
                response: err.response
                  ? {
                      status: err.response.status,
                      data: err.response.data,
                    }
                  : null,
              },
            },
            null,
            2,
          );
        });

        setError(err.message || '로그인 처리 중 오류가 발생했습니다.');

        // 로그아웃 처리 후 로그인 페이지로 이동
        logout();
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      } finally {
        if (retryCountRef.current === 0 || retryCountRef.current === MAX_RETRIES) {
          setLoading(false);
        }
      }
    };

    processKakaoLogin();
  }, [navigate, location.pathname, location.search]);

  return (
    <LoadingContainer>
      <LogoImage />
      {loading && <Spinner />}

      {error ? (
        <ErrorText>{error}</ErrorText>
      ) : (
        <LoadingText>
          {loading ? '로그인 처리 중입니다...' : '로그인 성공! 홈으로 이동합니다.'}
        </LoadingText>
      )}

      {/* 개발 환경에서만 디버깅 정보 표시 */}
      {process.env.NODE_ENV !== 'production' && debugInfo && (
        <DebugContainer>
          <pre>{debugInfo}</pre>
        </DebugContainer>
      )}
    </LoadingContainer>
  );
};

export default KakaoCallback;
