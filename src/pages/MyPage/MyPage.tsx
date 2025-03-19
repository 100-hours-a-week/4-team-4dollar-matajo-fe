import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import { useAuth, UserRole } from '../../contexts/AuthContext';

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

// 푸터 컨테이너 추가
const FooterContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px;
  margin-bottom: 10px;
`;

// 푸터 텍스트 스타일 수정
const FooterText = styled.div<{ left?: number }>`
  color: #666;
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 300;
  line-height: 14.4px;
  word-wrap: break-word;
  cursor: pointer;
  margin: 0 5px;
`;

// 사업자 정보 컨테이너 추가
const BusinessInfoContainer = styled.div`
  margin-top: 30px;
  text-align: center;
  padding: 10px;
  width: 100%;
  border-top: 1px solid #eee;
`;

// 사업자 정보 스타일 추가
const BusinessInfo = styled.p`
  color: #999;
  font-size: 10px;
  font-family: 'Noto Sans KR';
  font-weight: 300;
  line-height: 1.4;
  margin: 3px 0;
`;

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

// 메뉴 링크 컨테이너
const MenuLinksContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
`;

// 구분선 스타일 수정
const Separator = styled.span`
  color: #999;
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 300;
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

// 화살표 아이콘 SVG로 교체
const ChevronIcon = styled.div`
  width: 24px;
  height: 24px;
  position: relative;
  margin-right: 12px;
  background: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 17L15 12L10 7' stroke='%237F7F7F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
    no-repeat center center;
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
  width: 100%;
  max-width: 375px;
  height: calc(100vh - 76px); /* 네비게이션 바 높이 제외 */
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  margin: 0 auto;
  margin-bottom: 76px; /* 하단 네비게이션 높이만큼 마진 */
`;

// 메인 컴포넌트
const MyPage: React.FC = () => {
  const navigate = useNavigate();

  // 실제로는 useAuth를 사용해 사용자 정보 가져오기
  // const { user, logout, isKeeper, registerAsKeeper } = useAuth();

  // 백엔드 연동 전 임시 상수
  const USER_STATE = {
    isKeeper: false, // 보관인 여부 (true: 보관인, false: 의뢰인)
    userName: '타조 89389', // 사용자 이름
  };

  // 모달 상태 관리
  const [isKeeperModalOpen, setIsKeeperModalOpen] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);

  // 토스트 메시지 상태 관리
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  // 토스트 메시지 표시 함수
  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);

    // 3초 후 토스트 메시지 숨기기
    setTimeout(() => {
      setIsToastVisible(false);
    }, 3000);
  };

  // 내 거래내역 보기 이동 핸들러
  const moveToMyTradePage = () => {
    // 내 거래내역 페이지로 이동
    navigate('/mytrade');
  };

  // 보관인 등록 핸들러
  const handleKeeperRegistration = () => {
    // 이미 보관인인 경우 토스트 메시지 표시
    if (USER_STATE.isKeeper) {
      showToast('이미 보관인으로 등록되었습니다.');
      return;
    }

    // 의뢰인인 경우 모달 표시
    setIsKeeperModalOpen(true);
  };

  // 내 보관소 조회 핸들러
  const moveToMyPlacePage = () => {
    // 보관인이 아닌 경우 보관인 등록 모달 표시
    if (!USER_STATE.isKeeper) {
      setIsKeeperModalOpen(true);
      return;
    }

    // 보관인인 경우 내 보관소 페이지로 이동
    navigate('/myplace');
  };

  // 개인정보 약관 이동 핸들러
  const moveToPrivacyPolicy = () => {
    // 개인정보 약관 페이지로 이동 (임시로 외부 링크로 처리)
    window.open('https://www.notion.so', '_blank');
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    // 로그아웃 처리
    showToast('로그아웃 되었습니다');

    // 실제 로그아웃 로직 (주석처리)
    /*
    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 상태 초기화 로직이 있다면 여기에 추가
    
    // 로그인 페이지로 이동
    setTimeout(() => {
      navigate('/login');
    }, 1000);
    */
  };

  // 회원 탈퇴 모달 열기
  const openMembershipModal = () => {
    setIsMembershipModalOpen(true);
  };

  // 보관인 등록 확인 처리
  const handleKeeperConfirm = () => {
    // 보관인 등록 페이지로 이동
    // 실제 구현 시에는 API 호출 및 정보 검증 로직 추가
    navigate('/keeper/registration');
  };
  // 보관인 등록 취소 처리
  const handleKeeperCancel = () => {
    setIsKeeperModalOpen(false);
  };

  // 회원 탈퇴 확인 처리
  const handleMembershipConfirm = () => {
    // 회원 탈퇴 처리 로직 (주석처리)
    /*
    // API 호출로 회원 탈퇴 처리
    // 성공 시 로컬 스토리지 정보 제거 및 로그인 페이지로 이동
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    */

    showToast('회원 탈퇴가 완료되었습니다');

    // 로그인 페이지로 이동 (실제로는 API 호출 성공 후 이동)
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  // 회원 탈퇴 취소 처리
  const handleMembershipCancel = () => {
    setIsMembershipModalOpen(false);
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

      {/* 토스트 메시지 */}
      <Toast
        message={toastMessage}
        visible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />

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

      {/* 회원 탈퇴 모달 */}
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
      <UserName>{USER_STATE.userName}</UserName>
      <ProfileDivider />
      <HelperText>헬퍼텍스트입니다</HelperText>
      {/* 배지 영역 */}
      <BadgeContainer left={107} />
      <BadgeText left={111}>의뢰인</BadgeText>

      {USER_STATE.isKeeper && (
        <>
          <BadgeContainer left={143} />
          <BadgeText left={147}>보관인</BadgeText>
        </>
      )}

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
          <ChevronIcon />
        </MenuItemWrapper>
      </div>
      <Divider top={300} />
      <div style={{ position: 'absolute', left: '11px', top: '305px', width: '346px' }}>
        <MenuItemWrapper onClick={handleKeeperRegistration}>
          <MenuItem>보관인 등록</MenuItem>
          <ChevronIcon />
        </MenuItemWrapper>
      </div>
      <Divider top={360} />
      <div style={{ position: 'absolute', left: '11px', top: '365px', width: '346px' }}>
        <MenuItemWrapper onClick={moveToMyPlacePage}>
          <MenuItem>내 보관소 조회</MenuItem>
          <ChevronIcon />
        </MenuItemWrapper>
      </div>
      <Divider top={420} />

      {/* 푸터 영역 */}
      <FooterContainer>
        {/* 푸터 링크 */}
        <MenuLinksContainer>
          <FooterText onClick={moveToPrivacyPolicy}>개인정보 약관</FooterText>
          <Separator>|</Separator>
          <FooterText onClick={handleLogout}>로그아웃</FooterText>
          <Separator>|</Separator>
          <FooterText onClick={openMembershipModal}>회원탈퇴</FooterText>
        </MenuLinksContainer>

        {/* 사업자 정보 */}
        <BusinessInfoContainer>
          <BusinessInfo>(주)마타조 | 대표이사: 홍길동</BusinessInfo>
          <BusinessInfo>사업자등록번호: 123-45-67890</BusinessInfo>
          <BusinessInfo>주소: 서울특별시 영등포구 여의도동 국제금융로 10</BusinessInfo>
          <BusinessInfo>고객센터: 1588-0000 | 이메일: support@matoajo.com</BusinessInfo>
          <BusinessInfo>© 2025 마타조(MATOAJO) Inc. All rights reserved.</BusinessInfo>
        </BusinessInfoContainer>
      </FooterContainer>

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="마이페이지" />
    </Container>
  );
};

export default MyPage;
