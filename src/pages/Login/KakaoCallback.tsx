// src/pages/Login/KakaoCallback.tsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { kakaoLogin } from '../../api/auth';
import { saveKakaoLoginData } from '../../utils/authUtils';

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

// 로딩 텍스트
const LoadingText = styled.p`
  font-size: 18px;
  margin-top: 20px;
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
 */
const KakaoCallback: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const requestSentRef = useRef(false); // 요청 전송 여부를 추적하는 ref

  useEffect(() => {
    // 이미 요청을 보냈다면 중복 실행 방지
    if (requestSentRef.current) return;

    // 인가 코드 추출
    const code = new URLSearchParams(window.location.search).get('code');
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
      navigate('/', { replace: true });
      return;
    }

    console.log('인가 코드 받음, 백엔드로 전송 중...');
    requestSentRef.current = true; // 요청 전송 표시

    // 직접 백엔드의 /auth/kakao 엔드포인트로 요청
    kakaoLogin(code)
      .then(response => {
        console.log('로그인 응답:', response);

        if (response.success) {
          // 처리 성공 시 코드 저장
          sessionStorage.setItem('processed_kakao_code', code);

          // 토큰 및 사용자 정보 저장
          const { accessToken } = response.data;

          // 유틸리티 함수를 사용하여 로그인 데이터 저장
          saveKakaoLoginData({
            accessToken,
          });
          console.log('로그인 정보 저장 완료:', localStorage.getItem('token'));

          // 메인 페이지로 리다이렉트 (토스트 메시지 표시 위한 상태 포함)
          console.log('홈으로 리다이렉트 시도...');
          setTimeout(() => {
            navigate('/', {
              replace: true,
              state: { showToast: true, message: '로그인에 성공하였습니다.' },
            });
          }, 2000);
        } else {
          throw new Error(response.message || '로그인 처리 중 오류가 발생했습니다.');
        }
      })
      .catch((err: any) => {
        console.error('카카오 로그인 오류:', err);

        if (err.response) {
          console.error('응답 상태:', err.response.status);
          console.error('응답 데이터:', err.response.data);
          console.error('응답 헤더:', err.response.headers);

          // 카카오 인증 코드 오류인 경우 명확한 메시지 표시
          if (err.response.data?.error_code === 'KOE320') {
            setError('인증 코드가 만료되었거나 이미 사용되었습니다. 다시 로그인해 주세요.');
          } else {
            // 백엔드에서 보내는 오류 메시지가 있다면 그것을 표시
            const errorMessage =
              err.response.data?.message ||
              err.response.data?.error ||
              '로그인 처리 중 오류가 발생했습니다.';
            setError(errorMessage);
          }
        } else {
          setError(err.message || '로그인 처리 중 오류가 발생했습니다.');
        }

        setTimeout(() => navigate('/login', { replace: true }), 2000);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]); // 의존성 배열에는 navigate만 포함

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
