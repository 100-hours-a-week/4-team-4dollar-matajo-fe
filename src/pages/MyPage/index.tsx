import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../hooks/auth';
import { logout } from '../../utils/api/authUtils';
import KeeperRegistrationModal from '../../components/modals/KeeperRegisterationModal';
import { useEffect } from 'react';
import { isAuthenticated, isKeeper } from '../../utils/api/authUtils';
import { checkKeeperRole } from '../../services/api/modules/keeper';
import axios from '../../services/api/client';
import { ROUTES } from '../../constants/routes';

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
  width: 100%;
  max-width: 375px;
  margin: 0 auto;
  position: relative;
  padding: 0 20px;
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// 푸터 텍스트 스타일 수정
const FooterText = styled.div`
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
  margin-top: 10px;
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
  width: 100%;
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${THEME.borderColor};
  margin: 5px 0;
`;

const ProfileCard = styled.div`
  width: 100%;
  max-width: 348px;
  height: 96px;
  background: ${THEME.lightBackground};
  border-radius: 10px;
  position: relative;
  margin: 20px auto;
`;

const ProfileImageContainer = styled.div`
  width: 65px;
  height: 62px;
  position: absolute;
  left: 15px;
  top: 17px;
  background: ${THEME.white};
  border-radius: 9999px;
`;

const ProfileImage = styled.img`
  width: 58px;
  height: 59px;
  position: absolute;
  left: 3px;
  top: 1px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 50%;
`;

const UserName = styled.div`
  position: absolute;
  left: 90px;
  top: 30px;
  color: black;
  font-size: 15px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.02px;
  word-wrap: break-word;
`;

const ProfileDivider = styled.div`
  width: 219px;
  height: 1px;
  position: absolute;
  left: 90px;
  top: 52px;
  background-color: #f7f7f7;
`;

const BadgeContainer = styled.div`
  width: 32px;
  height: 17px;
  position: absolute;
  left: 90px;
  top: 60px;
  background: ${THEME.darkBlue};
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BadgeText = styled.div`
  color: ${THEME.white};
  font-size: 9px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  letter-spacing: 0.01px;
  text-align: center;
`;

const HelperText = styled.div`
  position: absolute;
  left: 90px;
  top: 15px;
  color: rgba(255, 0, 0, 0);
  font-size: 8px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  letter-spacing: 0.01px;
  word-wrap: break-word;
`;

const ActionIconsContainer = styled.div`
  position: absolute;
  right: 15px;
  top: 30px;
  display: flex;
  gap: 10px;
`;

const ActionIcon = styled.div<{ color: string }>`
  width: 21px;
  height: 21px;
  background-color: ${props => props.color};
  border-radius: 50%;
`;

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 100%;
  max-width: 375px;
  min-height: calc(100vh - 120px);
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  margin: 0 auto;
`;

// 메뉴 섹션 컨테이너
const MenuSection = styled.div`
  width: 100%;
  max-width: 346px;
  margin: 80px auto 20px;
`;

// 메인 컴포넌트
const MyPage: React.FC = () => {
  const navigate = useNavigate();

  // 실제로는 useAuth를 사용해 사용자 정보 가져오기
  // const { user, logout, isKeeper, registerAsKeeper } = useAuth();

  // 백엔드 연동 전 임시 상수
  const [userState, setUserState] = useState({
    isKeeper: isKeeper(), // 초기값은 로컬에서 확인
    userName: '타조 89389', // 사용자 이름
  });

  // 모달 상태 관리
  const [isKeeperModalOpen, setIsKeeperModalOpen] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // 토스트 메시지 상태 관리
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  // 모달 관련 상태 추가
  const [modalSource, setModalSource] = useState<'keeper_registration' | 'my_place'>(
    'keeper_registration',
  );

  // 토스트 메시지 표시 함수
  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);

    // 3초 후 토스트 메시지 숨기기
    setTimeout(() => {
      setIsToastVisible(false);
    }, 3000);
  };

  // useEffect를 사용하여 페이지 로드 시 보관인 역할 확인
  useEffect(() => {
    // 로그인 상태인 경우에만 보관인 역할 확인
    if (isAuthenticated()) {
      const checkUserInfo = async () => {
        try {
          // 1. 로컬에서 먼저 보관인 여부 확인
          const isKeeperLocal = isKeeper();
          console.log('로컬 보관인 여부 확인:', isKeeperLocal);

          // 2. API로 보관인 역할 확인 (최신 정보)
          const isUserKeeper = await checkKeeperRole();
          console.log('API 보관인 여부 확인:', isUserKeeper);

          // 3. 사용자 정보 조회 (프로필 API 호출)
          const userInfoResponse = await axios.get('/api/users/me');
          const userNickname = userInfoResponse.data?.data?.nickname || '타조 회원';

          // 둘 중 하나라도 true면 보관인으로 처리
          const finalKeeperStatus = isKeeperLocal || isUserKeeper;

          // 상태 업데이트
          setUserState(prev => ({
            ...prev,
            isKeeper: finalKeeperStatus,
            userName: userNickname,
          }));

          console.log('마이페이지 사용자 상태 업데이트:', {
            isKeeper: finalKeeperStatus,
            userName: userNickname,
          });
        } catch (error) {
          console.error('사용자 정보 조회 실패:', error);

          // API 호출 실패 시 로컬 정보만으로 상태 설정
          setUserState(prev => ({
            ...prev,
            isKeeper: isKeeper(),
          }));
        }
      };

      checkUserInfo();

      // USER_ROLE_CHANGED 이벤트 리스너 등록
      const handleRoleChange = () => {
        console.log('역할 변경 감지됨, 상태 업데이트');
        setUserState(prev => ({
          ...prev,
          isKeeper: isKeeper(),
        }));
      };

      window.addEventListener('USER_ROLE_CHANGED', handleRoleChange);

      return () => {
        window.removeEventListener('USER_ROLE_CHANGED', handleRoleChange);
      };
    }
  }, []);

  // 내 거래내역 보기 이동 핸들러
  const moveToMyTradePage = () => {
    // 내 거래내역 페이지로 이동
    navigate('/mytrade');
  };

  // 보관인 등록 핸들러
  const handleKeeperRegistration = async () => {
    try {
      // 로컬 상태에서 먼저 체크 (API 호출 전에)
      if (userState.isKeeper) {
        console.log('이미 보관인으로 등록되었습니다. 보관소 등록 페이지로 이동합니다.');
        navigate(`/${ROUTES.MYPAGE}/${ROUTES.REGISTRATION_STEP1}`);
        return;
      }

      // 최신 상태 확인을 위해 API 호출
      const isUserKeeper = await checkKeeperRole();

      // 이미 보관인인 경우 보관소 등록 페이지로 리다이렉트
      if (isUserKeeper) {
        console.log('이미 보관인으로 등록되었습니다. 보관소 등록 페이지로 이동합니다.');
        // 상태 업데이트
        setUserState(prev => ({
          ...prev,
          isKeeper: true,
        }));

        navigate(`/${ROUTES.MYPAGE}/${ROUTES.REGISTRATION_STEP1}`);
        return;
      }

      // 의뢰인인 경우 모달 표시
      setModalSource('keeper_registration');
      setIsKeeperModalOpen(true);
    } catch (error) {
      console.error('보관인 역할 확인 실패:', error);

      // 오류 발생 시 기본적으로 로컬 상태 확인
      if (userState.isKeeper) {
        navigate(`/${ROUTES.MYPAGE}/${ROUTES.REGISTRATION_STEP1}`);
        return;
      }

      // 그래도 확인이 안 되면 모달 표시
      setModalSource('keeper_registration');
      setIsKeeperModalOpen(true);
    }
  };

  // 내 보관소 조회 핸들러
  const moveToMyPlacePage = async () => {
    try {
      // 로컬 상태에서 먼저 체크
      if (userState.isKeeper) {
        console.log('보관인 역할 확인됨, 내 보관소 페이지로 이동합니다.');
        navigate('/myplace');
        return;
      }

      // 최신 상태 확인을 위해 API 호출
      const isUserKeeper = await checkKeeperRole();

      // 보관인인 경우 내 보관소 페이지로 이동
      if (isUserKeeper) {
        console.log('API 호출로 보관인 역할 확인됨, 내 보관소 페이지로 이동합니다.');

        // 상태 업데이트
        setUserState(prev => ({
          ...prev,
          isKeeper: true,
        }));

        navigate('/myplace');
        return;
      }

      // 보관인이 아닌 경우 보관인 등록 모달 표시
      console.log('보관인 역할이 없음, 보관인 등록 모달을 표시합니다.');
      setModalSource('my_place');
      setIsKeeperModalOpen(true);
    } catch (error) {
      console.error('보관인 역할 확인 실패:', error);

      // 오류 발생 시 로컬 상태 확인
      if (userState.isKeeper) {
        navigate('/myplace');
        return;
      }

      // 확인이 안 되면 모달 표시
      setModalSource('my_place');
      setIsKeeperModalOpen(true);
    }
  };

  // 개인정보 약관 이동 핸들러
  const moveToPrivacyPolicy = () => {
    // 개인정보 약관 페이지로 이동 (임시로 외부 링크로 처리)
    window.open('https://www.notion.so', '_blank');
  };

  // 로그아웃 모달 열기
  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  // 로그아웃 처리 함수
  const handleLogout = () => {
    // 로그아웃 함수 호출 (authUtils에서 가져온 함수)
    logout();

    // 모달 닫기
    setIsLogoutModalOpen(false);

    // 로그인 페이지로 즉시 이동
    navigate('/login');
  };

  // 회원 탈퇴 모달 열기
  const openMembershipModal = () => {
    setIsMembershipModalOpen(true);
  };

  // 보관인 등록 확인 처리
  const handleKeeperConfirm = () => {
    // 모달 닫기
    setIsKeeperModalOpen(false);

    // 보관인 등록 페이지로 이동
    console.log('보관인 등록 페이지로 이동합니다.');
    navigate(`/${ROUTES.MYPAGE}/${ROUTES.KEEPER_REGISTRATION}`);
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
    */

    // 로그아웃 처리
    logout();

    showToast('회원 탈퇴가 완료되었습니다');

    // 로그인 페이지로 이동
    navigate('/login');
  };

  // 회원 탈퇴 취소 처리
  const handleMembershipCancel = () => {
    setIsMembershipModalOpen(false);
  };

  // 로그아웃 취소 처리
  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  // 모달 내용 컴포넌트 - 보관인 등록
  const keeperRegistrationContent = (() => {
    if (modalSource === 'my_place') {
      return (
        <>
          <GrayText>
            보관소를 조회하려면
            <br />
          </GrayText>
          <HighlightText>보관인 등록</HighlightText>
          <GrayText>이 필요합니다. 등록하시겠습니까?</GrayText>
        </>
      );
    }
    // 기본 등록 모달
    return (
      <>
        <GrayText>
          보관인 미등록 계정입니다.
          <br />
        </GrayText>
        <HighlightText>보관인 등록</HighlightText>
        <GrayText>하시겠습니까?</GrayText>
      </>
    );
  })();

  // 모달 내용 컴포넌트 - 회원 탈퇴
  const cancelMembershipContent = (
    <>
      <HighlightText>회원 탈퇴</HighlightText>
      <GrayText>를 하시겠습니까?</GrayText>
    </>
  );

  // 모달 내용 컴포넌트 - 로그아웃
  const logoutContent = (
    <>
      <HighlightText>로그아웃</HighlightText>
      <GrayText>을 하시겠습니까?</GrayText>
      <div style={{ fontSize: '13px', color: '#909090', marginTop: '10px' }}>
        로그아웃 하시면 서비스를 이용할 수 없습니다.
      </div>
    </>
  );

  return (
    <Container>
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

      {/* 로그아웃 모달 */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        content={logoutContent}
        cancelText="취소"
        confirmText="로그아웃"
        onCancel={handleLogoutCancel}
        onConfirm={handleLogout}
      />

      {/* 프로필 카드 */}
      <ProfileCard>
        <ProfileImageContainer>
          <ProfileImage src="https://placehold.co/58x59" />
        </ProfileImageContainer>
        <HelperText>헬퍼텍스트입니다</HelperText>
        <UserName>{userState.userName}</UserName>
        <ProfileDivider />

        <BadgeContainer>
          <BadgeText>의뢰인</BadgeText>
        </BadgeContainer>

        {userState.isKeeper && (
          <BadgeContainer style={{ left: '130px' }}>
            <BadgeText>보관인</BadgeText>
          </BadgeContainer>
        )}

        <ActionIconsContainer>
          <ActionIcon color={THEME.accentGreen} />
          <ActionIcon color={THEME.accentRed} />
        </ActionIconsContainer>
      </ProfileCard>

      {/* 메뉴 섹션 */}
      <MenuSection>
        <Divider />
        <MenuItemWrapper onClick={moveToMyTradePage}>
          <MenuItem>내 거래 내역 보기</MenuItem>
          <ChevronIcon />
        </MenuItemWrapper>

        <Divider />
        <MenuItemWrapper onClick={handleKeeperRegistration}>
          <MenuItem>보관장소 등록</MenuItem>
          <ChevronIcon />
        </MenuItemWrapper>

        <Divider />
        <MenuItemWrapper onClick={moveToMyPlacePage}>
          <MenuItem>내 보관소 조회</MenuItem>
          <ChevronIcon />
        </MenuItemWrapper>

        <Divider />
      </MenuSection>

      {/* 푸터 영역 */}
      <FooterContainer>
        {/* 푸터 링크 */}
        <MenuLinksContainer>
          <FooterText onClick={moveToPrivacyPolicy}>개인정보 약관</FooterText>
          <Separator>|</Separator>
          <FooterText onClick={openLogoutModal}>로그아웃</FooterText>
          <Separator>|</Separator>
          <FooterText onClick={openMembershipModal}>회원탈퇴</FooterText>
        </MenuLinksContainer>

        {/* 사업자 정보 */}
        <BusinessInfoContainer>
          <BusinessInfo>(주)마타조 | 대표이사: 정유진</BusinessInfo>
          <BusinessInfo>사업자등록번호: 604-11-41401</BusinessInfo>
          <BusinessInfo>이메일: matajoktb@gmail.com</BusinessInfo>
          <BusinessInfo>© 2025 마타조(MATOAJO) Inc. All rights reserved.</BusinessInfo>
        </BusinessInfoContainer>
      </FooterContainer>
    </Container>
  );
};

export default MyPage;
