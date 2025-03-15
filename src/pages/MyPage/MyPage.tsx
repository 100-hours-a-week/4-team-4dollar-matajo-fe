import React, { useState } from 'react';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import Modal from '../../components/common/Modal';

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

// 모달관련 스타일 컴포넌트트
const GrayText = styled.span`
  color: #5b5a5d;
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  line-height: 19.21px;
  word-wrap: break-word;
`;

const HighlightText = styled.span`
  color: #010048;
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  line-height: 19.21px;
  word-wrap: break-word;
`;

// 반복적으로 사용되는 스타일 컴포넌트 통합

const MenuItem = styled.div`
  color: ${THEME.grayText};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.01px;
  margin-left: 12px;
`;

const ChevronIcon = styled.div`
  width: 20px;
  height: 19px;
  position: relative;
  margin-right: 12px;
  & > div {
    width: 9.05px;
    height: 14.19px;
    left: 5.83px;
    top: 2.38px;
    position: absolute;
    background: ${THEME.grayText};
  }
`;

// 메뉴 아이템 래퍼 (클릭 가능한 영역)
const MenuItemWrapper = styled.div`
  position: relative;
  width: 346px;
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  top: 578px;
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
  height: calc(100vh - 76px); /* 네비게이션 바 높이 제외 */
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 76px; /* 하단 네비게이션 높이만큼 마진 */
`;

// 메인 컴포넌트
const MyPage: React.FC = () => {
  // 모달 상태 관리
  const [isKeeperModalOpen, setIsKeeperModalOpen] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);

  const moveToMyTradePage = () => {
    console.log('내 거래내역으로~');
    // 여기에 내 거래내역으로 페이지 이동하는 로직 추가
  };

  // 보관인 등록 모달 열기
  const openKeeperModal = () => {
    setIsKeeperModalOpen(true);
  };

  const moveToMyPlacePage = () => {
    console.log('내 보관소로~');
    // 여기에 내 보관소로 페이지 이동하는 로직 추가
  };

  // 회원 탈퇴 모달 열기
  const openMembershipModal = () => {
    setIsMembershipModalOpen(true);
  };

  // 보관인 등록 확인 처리
  const handleKeeperConfirm = () => {
    console.log('보관인 등록 처리');
    // 여기에 보관인 등록 관련 로직 추가
  };

  // 보관인 등록 취소 처리
  const handleKeeperCancel = () => {
    console.log('보관인 등록 취소');
  };

  // 회원 탈퇴 확인 처리
  const handleMembershipConfirm = () => {
    console.log('회원 탈퇴 처리');
    // 여기에 회원 탈퇴 관련 로직 추가
  };

  // 회원 탈퇴 취소 처리
  const handleMembershipCancel = () => {
    console.log('회원 탈퇴 취소');
  };

  // 모달 내용 컴포넌트 - 보관인 등록
  const keeperRegistrationContent = (
    <>
      <GrayText>
        보관인 미등록 계정입니다.
        <br />
      </GrayText>
      <HighlightText>보관인 등록</HighlightText>
      <GrayText>하시겠습니까?</GrayText>
    </>
  );

  // 모달 내용 컴포넌트 - 회원 탈퇴
  const cancelMembershipContent = (
    <>
      <HighlightText>회원 탈퇴</HighlightText>
      <GrayText>를 하시겠습니까?</GrayText>
    </>
  );

  return (
    <Container>
      {/* 페이지 헤더 */}
      <Header title="마이페이지" />

      {/* 보관인 등록 모달 */}
      <Modal
        isOpen={isKeeperModalOpen}
        onClose={() => setIsKeeperModalOpen(false)}
        content={keeperRegistrationContent}
        cancelText="취소"
        confirmText="등록"
        onCancel={handleKeeperCancel}
        onConfirm={handleKeeperConfirm}
      />

      {/* 회원 탈퇴퇴 모달 */}
      <Modal
        isOpen={isMembershipModalOpen}
        onClose={() => setIsMembershipModalOpen(false)}
        content={cancelMembershipContent}
        cancelText="취소"
        confirmText="탈퇴"
        onCancel={handleMembershipCancel}
        onConfirm={handleMembershipConfirm}
      />

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
      <div style={{ position: 'absolute', left: '11px', top: '245px', width: '346px' }}>
        <MenuItemWrapper onClick={moveToMyTradePage}>
          <MenuItem>내 거래 내역 보기</MenuItem>
          <ChevronIcon>
            <div />
          </ChevronIcon>
        </MenuItemWrapper>
      </div>
      <Divider top={300} />
      <div style={{ position: 'absolute', left: '11px', top: '305px', width: '346px' }}>
        <MenuItemWrapper onClick={openKeeperModal}>
          <MenuItem>보관인 등록</MenuItem>
          <ChevronIcon>
            <div />
          </ChevronIcon>
        </MenuItemWrapper>
      </div>
      <Divider top={360} />
      <div style={{ position: 'absolute', left: '11px', top: '365px', width: '346px' }}>
        <MenuItemWrapper onClick={moveToMyPlacePage}>
          <MenuItem>내 보관소 조회</MenuItem>
          <ChevronIcon>
            <div />
          </ChevronIcon>
        </MenuItemWrapper>
      </div>
      <Divider top={420} />

      {/* 푸터 링크 */}
      <FooterText left={74}>개인정보 약관</FooterText>
      <Separator left={153}>|</Separator>
      <FooterText left={168}>로그아웃</FooterText>
      <Separator left={224}>|</Separator>
      <FooterText left={239} onClick={openMembershipModal}>
        회원탈퇴
      </FooterText>

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="마이페이지" />
    </Container>
  );
};

export default MyPage;
