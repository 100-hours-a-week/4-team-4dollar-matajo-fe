// src/pages/Login/index.tsx
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { KAKAO_AUTH } from '../../constants/api';
import { logout } from '../../utils/api/authUtils';

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
  // 로그인 페이지 마운트 시 로그아웃 처리
  useEffect(() => {
    // 로그아웃 함수 호출로 로컬 스토리지 정리
    logout();

    // 모든 쿠키 삭제
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    console.log('로그인 페이지 마운트: 로그아웃 및 쿠키 정리 완료');
  }, []);

  // 카카오 로그인 처리 함수
  const handleKakaoLogin = () => {
    // 콘스탄트 파일에서 정의된 함수 사용
    const kakaoAuthUrl = KAKAO_AUTH.getLoginUrl();
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
