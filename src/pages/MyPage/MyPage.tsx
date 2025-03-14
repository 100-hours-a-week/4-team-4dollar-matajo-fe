import React from 'react';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';

// 테마 컬러 상수 정의 - 향후 별도 파일로 분리 가능
const THEME = {
  primary: '#3835FD',
  background: '#F5F5FF',
  lightBackground: '#E7E6FF',
  darkText: '#170E2B',
  grayText: '#7F7F7F',
  accentGreen: '#29CC6A',
  accentRed: '#FC5555',
  darkBlue: '#010048',
  borderColor: '#DCDCDC',
  white: '#FFFFFF',
};

// 반복적으로 사용되는 스타일 컴포넌트 통합

const MenuItem = styled.div<{ top: number }>`
  position: absolute;
  left: 22px;
  top: ${props => props.top}px;
  color: ${THEME.grayText};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.01px;
  word-wrap: break-word;
`;

const ChevronIcon = styled.div<{ top: number }>`
  width: 20px;
  height: 19px;
  position: absolute;
  left: 326px;
  top: ${props => props.top}px;

  & > div {
    width: 9.05px;
    height: 14.19px;
    left: 5.83px;
    top: 2.38px;
    position: absolute;
    background: ${THEME.grayText};
  }
`;

const Divider = styled.div<{ top: number }>`
  width: 346px;
  height: 0;
  position: absolute;
  left: 11px;
  top: ${props => props.top}px;
  outline: 1px ${THEME.borderColor} solid;
  outline-offset: -0.5px;
`;

const FooterText = styled.div<{ left: number }>`
  position: absolute;
  left: ${props => props.left}px;
  top: 678px;
  color: black;
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 300;
  line-height: 14.4px;
  word-wrap: break-word;
`;

const Separator = styled.div<{ left: number }>`
  width: 8px;
  height: 27px;
  position: absolute;
  left: ${props => props.left}px;
  top: 671px;
  color: black;
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 300;
  line-height: 14.4px;
  word-wrap: break-word;
`;

const ProfileCard = styled.div`
  width: 348px;
  height: 96px;
  position: absolute;
  left: 13px;
  top: 104px;
  background: ${THEME.lightBackground};
  border-radius: 10px;
`;

const ProfileImageContainer = styled.div`
  width: 65px;
  height: 62px;
  position: absolute;
  left: 26px;
  top: 120px;
  background: ${THEME.white};
  border-radius: 9999px;
`;

const ProfileImage = styled.img`
  width: 58px;
  height: 59px;
  position: absolute;
  left: 31px;
  top: 118px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const UserName = styled.div`
  position: absolute;
  left: 108px;
  top: 130px;
  color: black;
  font-size: 15px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.02px;
  word-wrap: break-word;
`;

const ProfileDivider = styled.div`
  width: 219px;
  height: 0;
  position: absolute;
  left: 108px;
  top: 152px;
  outline: 1px #f7f7f7 solid;
  outline-offset: -0.5px;
`;

const BadgeContainer = styled.div<{ left: number }>`
  width: 32px;
  height: 17px;
  position: absolute;
  left: ${props => props.left}px;
  top: 158px;
  background: ${THEME.darkBlue};
  border-radius: 5px;
`;

const BadgeText = styled.div<{ left: number }>`
  position: absolute;
  left: ${props => props.left}px;
  top: 161px;
  color: ${THEME.white};
  font-size: 9px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  letter-spacing: 0.01px;
  word-wrap: break-word;
`;

const HelperText = styled.div`
  position: absolute;
  left: 109px;
  top: 120px;
  color: ${THEME.accentRed};
  font-size: 8px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  letter-spacing: 0.01px;
  word-wrap: break-word;
`;

const ActionIcon = styled.div<{ left: number; color: string }>`
  width: 21px;
  height: 21px;
  position: absolute;
  left: ${props => props.left}px;
  top: 126px;

  & > div {
    width: 14.62px;
    height: 12.29px;
    left: 3.5px;
    top: 4.38px;
    position: absolute;
    background: ${props => props.color};
  }
`;

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 375px;
  height: 812px;
  position: relative;
  background: white;
  overflow: hidden;
`;

// 메인 컴포넌트
const MyPage: React.FC = () => {
  return (
    <Container>
      {/* 페이지 헤더 */}
      <Header title="마이페이지" />

      {/* 프로필 카드 */}
      <ProfileCard />
      <ProfileImageContainer />
      <ProfileImage src="https://placehold.co/58x59" />
      <UserName>타조 89389</UserName>
      <ProfileDivider />
      <HelperText>헬퍼텍스트입니다</HelperText>

      {/* 배지 영역 */}
      <BadgeContainer left={107} />
      <BadgeContainer left={143} />
      <BadgeText left={111}>의뢰인</BadgeText>
      <BadgeText left={147}>보관인</BadgeText>

      {/* 액션 아이콘 */}
      <ActionIcon left={223} color={THEME.accentGreen}>
        <div style={{ width: 14.62, height: 12.29, left: 3.5, top: 4.38, position: 'absolute' }} />
      </ActionIcon>
      <ActionIcon left={248} color={THEME.accentRed}>
        <div style={{ width: 14.44, height: 14.44, left: 3.5, top: 3.5, position: 'absolute' }} />
      </ActionIcon>

      {/* 메뉴 항목 */}
      <Divider top={240} />
      <MenuItem top={260}>내 거래 내역 보기</MenuItem>
      <ChevronIcon top={259}>
        <div />
      </ChevronIcon>

      <Divider top={297} />
      <MenuItem top={316}>보관인 등록</MenuItem>
      <ChevronIcon top={316}>
        <div />
      </ChevronIcon>

      <Divider top={350} />
      <MenuItem top={372}>내 보관소 조회</MenuItem>
      <ChevronIcon top={369}>
        <div />
      </ChevronIcon>

      <Divider top={407} />

      {/* 푸터 링크 */}
      <FooterText left={74}>개인정보 약관</FooterText>
      <Separator left={153}>|</Separator>
      <FooterText left={168}>로그아웃</FooterText>
      <Separator left={224}>|</Separator>
      <FooterText left={239}>회원탈퇴</FooterText>

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="마이페이지" />
    </Container>
  );
};

export default MyPage;
