// src/pages/Login/index.tsx
import React from 'react';
import styled from 'styled-components';

// 스타일 컴포넌트들
const PageContainer = styled.div`
  width: 375px;
  height: 812px;
  position: relative;
  background: white;
  overflow: hidden;
  margin: 0 auto;
`;

const TeamName = styled.span`
  color: rgba(0, 93.65, 79.6, 0.45);
  font-size: 14px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 500;
  letter-spacing: 0.01px;
  word-wrap: break-word;
  position: absolute;
  top: 20px;
  left: 20px;
`;

const LogoText = styled.span`
  color: black;
  font-size: 42px;
  font-family: 'Hakgyoansim Allimjang OTF', sans-serif;
  font-weight: 600;
  letter-spacing: 0.04px;
  word-wrap: break-word;
  position: absolute;
  top: 140px;
  left: 130px;
`;

const Slogan = styled.p`
  position: absolute;
  top: 200px;
  left: 85px;
`;

const SlightText = styled.span`
  color: #a0a0a0;
  font-size: 14px;
  font-family: 'Gmarket Sans TTF', sans-serif;
  font-weight: 500;
  letter-spacing: 0.01px;
  word-wrap: break-word;
`;

const BoldText = styled.span`
  color: black;
  font-size: 14px;
  font-family: 'Gmarket Sans TTF', sans-serif;
  font-weight: 500;
  letter-spacing: 0.01px;
  word-wrap: break-word;
`;

const KakaoLoginButton = styled.div`
  height: 45px;
  padding-left: 14px;
  padding-right: 14px;
  position: absolute;
  left: 42px;
  right: 42px;
  top: 576px;
  background: #fee500;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  width: calc(100% - 84px);
`;

const KakaoIconWrapper = styled.div`
  width: 18px;
  height: 17px;
  margin-right: 8px;
`;

const KakaoText = styled.span`
  color: rgba(0, 0, 0, 0.85);
  font-size: 15px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 400;
  line-height: 22.5px;
  word-wrap: break-word;
`;

const LogoImage = styled.div`
  width: 205px;
  height: 204px;
  position: absolute;
  left: 85px;
  top: 260px;
  background-image: url('/tajo-logo.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

const LoginPage: React.FC = () => {
  // 카카오 로그인 처리 함수
  const handleKakaoLogin = () => {
    const KAKAO_REST_API_KEY =
      process.env.REACT_APP_KAKAO_REST_API_KEY || '244abed4cb1b567f33d22e14fc58a2c5';

    // 백엔드가 기대하는 리다이렉트 URI로 변경
    const KAKAO_REDIRECT_URI = 'http://15.164.251.118:8080/auth/kakao/callback';

    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=code&prompt=login`;

    console.log('카카오 로그인 시작:', kakaoAuthUrl);
    window.location.href = kakaoAuthUrl;
  };

  return (
    <PageContainer>
      <TeamName>TEAM 4 DOLLAR</TeamName>
      <LogoText>MATAJO</LogoText>
      <Slogan>
        <SlightText>짐 보관하기 어려울 때, </SlightText>
        <BoldText>마타조</BoldText>
      </Slogan>

      {/* 로고 이미지 */}
      <LogoImage />

      {/* 카카오 로그인 버튼 */}
      <KakaoLoginButton onClick={handleKakaoLogin}>
        <KakaoIconWrapper>
          <svg
            width="18"
            height="17"
            viewBox="0 0 18 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.00002 0.0996094C4.02917 0.0996094 0 3.21257 0 7.05189C0 9.43963 1.5584 11.5446 3.93152 12.7966L2.93303 16.4441C2.84481 16.7664 3.21341 17.0233 3.49646 16.8365L7.87334 13.9478C8.2427 13.9835 8.61808 14.0043 9.00002 14.0043C13.9705 14.0043 17.9999 10.8914 17.9999 7.05189C17.9999 3.21257 13.9705 0.0996094 9.00002 0.0996094Z"
              fill="black"
            />
          </svg>
        </KakaoIconWrapper>
        <KakaoText>카카오 로그인</KakaoText>
      </KakaoLoginButton>
    </PageContainer>
  );
};

export default LoginPage;
