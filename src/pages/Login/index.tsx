// src/pages/Login/index.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { KAKAO_AUTH } from '../../constants/api';

// 스타일 컴포넌트
const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: white;
`;

const Logo = styled.div`
  width: 120px;
  height: 120px;
  background-image: url('/tajo-logo.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 40px;
  color: #333;
  text-align: center;
  font-family: 'Noto Sans KR', sans-serif;
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
  margin-bottom: 20px;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const KakaoText = styled.span`
  font-size: 16px;
  font-weight: bold;
  color: #000000;
  font-family: 'Noto Sans KR', sans-serif;
`;

const KakaoIcon = styled.div`
  width: 24px;
  height: 24px;
  background-image: url('https://cdn.icon-icons.com/icons2/2699/PNG/512/kakaotalk_logo_icon_168557.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-right: 8px;
`;

const LoginInfoText = styled.p`
  font-size: 14px;
  color: #666;
  margin-top: 20px;
  text-align: center;
  max-width: 300px;
  line-height: 1.5;
  font-family: 'Noto Sans KR', sans-serif;
`;

/**
 * 로그인 페이지 컴포넌트
 */
const Login: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 이미 로그인되어 있는 경우 메인 페이지로 리다이렉트
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/main', { replace: true });
    }
  }, [navigate]);

  // 카카오 로그인 처리 함수
  const handleKakaoLogin = () => {
    try {
      console.log('카카오 로그인 시도...');

      // 카카오 로그인 URL 생성 및 이동
      const kakaoLoginUrl = KAKAO_AUTH.getLoginUrl();
      console.log('카카오 로그인 URL:', kakaoLoginUrl);

      // 현재 창에서 카카오 로그인 페이지로 이동
      window.location.href = kakaoLoginUrl;
    } catch (error) {
      console.error('카카오 로그인 오류:', error);
    }
  };

  return (
    <LoginContainer>
      <Logo />
      <Title>마타조에 오신 것을 환영합니다!</Title>

      <KakaoButton onClick={handleKakaoLogin}>
        <KakaoIcon />
        <KakaoText>카카오로 시작하기</KakaoText>
      </KakaoButton>

      <LoginInfoText>
        카카오 계정을 통해 간편하게 로그인하고 <br></br>마타조 서비스의 모든 기능을 이용하세요.
      </LoginInfoText>
    </LoginContainer>
  );
};

export default Login;
