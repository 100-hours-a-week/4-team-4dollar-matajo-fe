import React from 'react';
import styled from 'styled-components';

// 스타일 정의
const HeaderContainer = styled.div`
  width: 373px;
  height: 47px;
  position: absolute;
  left: 0;
  top: 0;
  background: #f5f5ff;
`;

const Title = styled.div`
  position: absolute;
  left: 153px;
  top: 15px;
  color: #464646;
  font-size: 15px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.02px;
  word-wrap: break-word;
`;

// Props 타입 정의
interface HeaderProps {
  title: string;
  onBack?: () => void;
}

// 헤더 컴포넌트
const Header: React.FC<HeaderProps> = ({ title, onBack }) => {
  return (
    <HeaderContainer>
      <Title>{title}</Title>
    </HeaderContainer>
  );
};

export default Header;
