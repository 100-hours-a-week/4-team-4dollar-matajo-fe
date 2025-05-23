// src/pages/Login/index.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { KAKAO_AUTH } from '../../constants/api';
import { isLoggedIn } from '../../utils/api/authUtils';

// 스타일 컴포넌트
const LoginContainer = styled.div<{ isFading: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #292856;
  transition: opacity 0.3s ease;
  opacity: ${props => (props.isFading ? 0 : 1)};
`;

const Logo = styled.div`
  width: 200px;
  height: 200px;
  background-image: url('/onboarding.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-bottom: 40px;
`;

const KakaoButton = styled.button`
  background-color: #fee500;
  width: 300px;
  height: 50px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 150px;
  margin-bottom: 10px;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const LoginInfoText = styled.p`
  font-size: 12px;
  color: rgb(151, 151, 151);
  margin-top: 30px;
  text-align: center;
  max-width: 300px;
  line-height: 1.5;
  font-family: 'Noto Sans KR', sans-serif;
`;

const TeamText = styled.p`
  font-size: 14px;
  color: rgb(152, 178, 223);
  margin-top: 60px;
  text-align: center;
  font-family: 'Noto Sans KR', sans-serif;
`;

/**
 * 로그인 페이지 컴포넌트
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isFading, setIsFading] = React.useState(false);

  useEffect(() => {
    // 이미 로그인되어 있는 경우 메인 페이지로 리다이렉트
    if (isLoggedIn()) {
      navigate('/main', { replace: true });
    }
  }, [navigate]);

  // 카카오 로그인 처리 함수
  const handleKakaoLogin = () => {
    try {
      setIsFading(true);
      setTimeout(() => {
        console.log('카카오 로그인 시도...');

        // 카카오 로그인 URL 생성 및 이동
        const kakaoLoginUrl = KAKAO_AUTH.getLoginUrl();
        console.log('카카오 로그인 URL:', kakaoLoginUrl);

        // 현재 창에서 카카오 로그인 페이지로 이동
        window.location.href = kakaoLoginUrl;
      }, 300);
    } catch (error) {
      console.error('카카오 로그인 오류:', error);
    }
  };

  return (
    <LoginContainer isFading={isFading}>
      <Logo />

      <KakaoButton
        onClick={handleKakaoLogin}
        style={{ background: 'none', border: 'none', padding: 0 }}
      >
        <img
          src="/kakao-login-medium-wide.png"
          alt="Kakao Login"
          style={{ width: '100%', height: 'auto' }}
        />
      </KakaoButton>

      <LoginInfoText>
        카카오 계정을 통해 간편하게 로그인하고 <br></br>마타조 서비스의 모든 기능을 이용하세요.
      </LoginInfoText>

      <TeamText>TEAM 4$</TeamText>
    </LoginContainer>
  );
};

export default Login;
