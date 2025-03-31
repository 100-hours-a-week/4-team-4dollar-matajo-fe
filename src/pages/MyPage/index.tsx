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
// next/image와 react-icons/cg 대신 기본 이미지 태그 사용
// import Image from 'next/image';
// import { CgProfile } from 'react-icons/cg';

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

// 공통 스타일 정의 - 중복되는 스타일 속성 통합
const commonTextStyles = `
  font-family: 'Noto Sans KR';
  word-wrap: break-word;
`;

// 푸터 관련 스타일 컴포넌트 통합
const FooterContainer = styled.div`
  width: 100%;
  max-width: 95%;
  margin-top: auto;
  padding: 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60px;
`;

const FooterText = styled.div`
  color: #666;
  font-size: 12px;
  ${commonTextStyles}
  font-weight: 300;
  line-height: 14.4px;
  margin: 0 5px;
  cursor: pointer;
  align-items: center;
`;

const BusinessInfoContainer = styled.div`
  margin-top: 10px;
  text-align: center;
  padding: 10px;
  width: 100%;
  border-top: 1px solid #eee;
`;

const BusinessInfo = styled.p`
  color: #999;
  font-size: 10px;
  ${commonTextStyles}
  font-weight: 300;
  line-height: 1.4;
  margin: 3px 0;
  align-items: center;
`;

// 모달 관련 텍스트 스타일 통합
const ModalText = styled.span<{ isHighlight?: boolean }>`
  color: ${props => (props.isHighlight ? '#010048' : '#5b5a5d')};
  font-size: 16px;
  ${commonTextStyles}
  font-weight: ${props => (props.isHighlight ? 700 : 500)};
  line-height: 19.21px;
`;

// 구분선 관련 스타일 통합
const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${THEME.borderColor};
  margin: 5px 0;
`;

const Separator = styled.span`
  color: #999;
  font-size: 12px;
  ${commonTextStyles}
  font-weight: 300;
`;

// 메뉴 아이템 관련 스타일 통합
const MenuItem = styled.div`
  color: ${THEME.grayText};
  font-size: 14px;
  ${commonTextStyles}
  font-weight: 700;
  letter-spacing: 0.01px;
  margin-left: 12px;
`;

const MenuItemWrapper = styled.div`
  width: 100%;
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

// 프로필 관련 스타일 통합
const ProfileCard = styled.div`
  width: 100%;
  max-width: 348px;
  height: 96px;
  background: ${THEME.lightBackground};
  border-radius: 10px;
  position: relative;
  margin: 20px auto;
`;

const ProfileElement = styled.div<{ left?: string; top?: string }>`
  position: absolute;
  left: ${props => props.left || '0'};
  top: ${props => props.top || '0'};
`;

const ProfileImageContainer = styled(ProfileElement).attrs({ left: '15px', top: '17px' })`
  width: 65px;
  height: 62px;
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

const UserName = styled(ProfileElement).attrs({ left: '90px', top: '30px' })`
  color: black;
  font-size: 15px;
  ${commonTextStyles}
  font-weight: 700;
  letter-spacing: 0.02px;
`;

const ProfileDivider = styled(ProfileElement).attrs({ left: '90px', top: '52px' })`
  width: 219px;
  height: 1px;
  background-color: #f7f7f7;
`;

const BadgeContainer = styled(ProfileElement).attrs<{ offset?: number }>(props => ({
  left: props.offset ? `${props.offset}px` : '90px',
  top: '60px',
}))<{ offset?: number }>`
  width: 32px;
  height: 17px;
  background: ${THEME.darkBlue};
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BadgeText = styled.div`
  color: ${THEME.white};
  font-size: 9px;
  ${commonTextStyles}
  font-weight: 500;
  letter-spacing: 0.01px;
  text-align: center;
`;

// 컨테이너 컴포넌트 통합
const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 40px;
  min-height: 90vh;
  justify-content: space-between;
`;

// 메뉴 관련 컴포넌트 통합
const MenuSection = styled.div`
  width: 100%;
  max-width: 346px;
  margin: 20px auto;
`;

const MenuLinksContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  text-align: center;
  width: 100%;
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

// 메인 컴포넌트
const MyPage: React.FC = () => {
  const navigate = useNavigate();

  // 실제로는 useAuth를 사용해 사용자 정보 가져오기
  // const { user, logout, isKeeper, registerAsKeeper } = useAuth();

  // 상태 초기화 시 토큰 디코딩
  const decodeToken = (token: string) => {
    try {
      const base64Payload = token.split('.')[1];
      // base64 디코딩 시 padding 관련 문제 해결
      const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
      const padding = '='.repeat((4 - (base64.length % 4)) % 4);
      const jsonPayload = decodeURIComponent(
        atob(base64 + padding)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(''),
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('토큰 디코딩 실패:', error);
      return null;
    }
  };

  // 초기 상태 설정 - 페이지 로드 즉시 토큰 디코딩
  const initialUserState = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      const decoded = decodeToken(accessToken);
      console.log('디코딩된 토큰 정보:', decoded); // 디버깅용 로그

      if (decoded) {
        // 토큰 내의 다양한 가능한 필드명 확인
        const nickname = decoded.nickname || decoded.sub || decoded.name || '타조 91088';
        const isUserKeeper = decoded.role === 'KEEPER' || decoded.role === 'BOTH';
        // 프로필 이미지가 없으면 타조 로고 사용
        const profileImg = decoded.profileImage || decoded.avatar || '/tajo-logo.png';

        return {
          isKeeper: isUserKeeper,
          userName: nickname,
          profileImage: profileImg,
        };
      }
    }
    return {
      isKeeper: isKeeper(),
      userName: '타조 91088',
      profileImage: '/tajo-logo.png', // 기본 이미지를 타조 로고로 변경
    };
  };

  const [userState, setUserState] = useState(initialUserState());

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
    // 로그인 상태인 경우에만 추가적인 API 확인
    if (isAuthenticated()) {
      const checkUserInfo = async () => {
        try {
          // 1. 토큰에서 정보를 가져왔는지 콘솔에 출력
          console.log('현재 상태:', userState);

          // 2. API로 보관인 역할 검증 (초기화 후 백엔드와 동기화 목적)
          const isUserKeeper = await checkKeeperRole();

          // 3. API 정보와 상태가 다르면 업데이트
          if (isUserKeeper !== userState.isKeeper) {
            setUserState(prev => ({
              ...prev,
              isKeeper: isUserKeeper,
            }));
            console.log('API 확인 결과로 보관인 상태 업데이트:', isUserKeeper);
          }

          // 4. 사용자 프로필 정보 업데이트 - 항상 시도하여 최신 정보 유지
          try {
            const userInfoResponse = await axios.get('/api/users/me');
            console.log('사용자 정보 API 응답:', userInfoResponse.data);

            if (userInfoResponse.data?.data) {
              const { nickname, profileImage } = userInfoResponse.data.data;
              setUserState(prev => ({
                ...prev,
                userName: nickname || '타조 91088',
                profileImage: profileImage || '/tajo-logo.png', // 여기도 타조 로고로 변경
              }));
              console.log('API에서 가져온 닉네임:', nickname);
            }
          } catch (profileError) {
            console.warn('프로필 정보 조회 실패:', profileError);
            // 토큰에서 가져온 정보 유지
          }
        } catch (error) {
          console.error('보관인 역할 검증 실패:', error);
        }
      };

      checkUserInfo();

      // USER_ROLE_CHANGED 이벤트 리스너 등록
      const handleRoleChange = () => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          const decoded = decodeToken(accessToken);
          if (decoded) {
            setUserState(prev => ({
              ...prev,
              isKeeper: decoded.role === 'KEEPER' || decoded.role === 'BOTH',
            }));
            console.log('역할 변경 감지, 상태 업데이트:', decoded.role);
          }
        }
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
        navigate(`${ROUTES.STORAGE_REGISTER}`);
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

        navigate(`${ROUTES.STORAGE_REGISTER}`);
        return;
      }

      // 의뢰인인 경우 모달 표시
      setModalSource('keeper_registration');
      setIsKeeperModalOpen(true);
    } catch (error) {
      console.error('보관인 역할 확인 실패:', error);

      // 오류 발생 시 기본적으로 로컬 상태 확인
      if (userState.isKeeper) {
        navigate(`${ROUTES.STORAGE_REGISTER}`);
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
        navigate('/storage/myplace');
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

        navigate('/storage/myplace');
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
        navigate('/storage/myplace');
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
    window.open('https://matajo.notion.site/termsandconditions?pvs=4', '_blank');
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

  // 모달 내용 렌더링 함수 통합
  const renderModalContent = () => {
    if (isKeeperModalOpen) {
      if (modalSource === 'my_place') {
        return (
          <>
            <ModalText>
              보관소를 조회하려면
              <br />
            </ModalText>
            <ModalText isHighlight>보관인 등록</ModalText>
            <ModalText>이 필요합니다. 등록하시겠습니까?</ModalText>
          </>
        );
      }
      return (
        <>
          <ModalText>
            보관인 미등록 계정입니다.
            <br />
          </ModalText>
          <ModalText isHighlight>보관인 등록</ModalText>
          <ModalText>하시겠습니까?</ModalText>
        </>
      );
    } else if (isMembershipModalOpen) {
      return (
        <>
          <ModalText isHighlight>회원 탈퇴</ModalText>
          <ModalText>를 하시겠습니까?</ModalText>
        </>
      );
    } else if (isLogoutModalOpen) {
      return (
        <>
          <ModalText isHighlight>로그아웃</ModalText>
          <ModalText>을 하시겠습니까?</ModalText>
          <div style={{ fontSize: '13px', color: '#909090', marginTop: '10px' }}>
            로그아웃 하시면 서비스를 이용할 수 없습니다.
          </div>
        </>
      );
    }
    return null;
  };

  // 모달 속성 결정 함수
  const getModalProps = () => {
    if (isKeeperModalOpen) {
      return {
        isOpen: isKeeperModalOpen,
        onClose: () => setIsKeeperModalOpen(false),
        cancelText: '취소',
        confirmText: '등록',
        onCancel: handleKeeperCancel,
        onConfirm: handleKeeperConfirm,
      };
    } else if (isMembershipModalOpen) {
      return {
        isOpen: isMembershipModalOpen,
        onClose: () => setIsMembershipModalOpen(false),
        cancelText: '취소',
        confirmText: '탈퇴',
        onCancel: handleMembershipCancel,
        onConfirm: handleMembershipConfirm,
      };
    } else if (isLogoutModalOpen) {
      return {
        isOpen: isLogoutModalOpen,
        onClose: () => setIsLogoutModalOpen(false),
        cancelText: '취소',
        confirmText: '로그아웃',
        onCancel: handleLogoutCancel,
        onConfirm: handleLogout,
      };
    }
    return {
      isOpen: false,
      onClose: () => {},
      cancelText: '',
      confirmText: '',
      onCancel: () => {},
      onConfirm: () => {},
    };
  };

  return (
    <Container>
      {/* 페이지 헤더 */}
      <Header title="마이페이지" />

      {/* 프로필 카드 */}
      <ProfileCard>
        <ProfileImageContainer>
          <ProfileImage
            src={userState.profileImage}
            alt="프로필 이미지"
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'cover',
              borderRadius: '50%',
              position: 'absolute',
              left: '2px',
              top: '1px',
            }}
          />
        </ProfileImageContainer>
        <UserName>{userState.userName}</UserName>
        <ProfileDivider />

        <BadgeContainer>
          <BadgeText>의뢰인</BadgeText>
        </BadgeContainer>

        {userState.isKeeper && (
          <BadgeContainer offset={130}>
            <BadgeText>보관인</BadgeText>
          </BadgeContainer>
        )}
      </ProfileCard>

      {/* 메뉴 섹션 */}
      <MenuSection>
        <Divider />
        {[
          { label: '내 거래 내역 보기', onClick: moveToMyTradePage },
          { label: '보관장소 등록', onClick: handleKeeperRegistration },
          { label: '내 보관소 조회', onClick: moveToMyPlacePage },
        ].map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Divider />}
            <MenuItemWrapper onClick={item.onClick}>
              <MenuItem>{item.label}</MenuItem>
              <ChevronIcon />
            </MenuItemWrapper>
          </React.Fragment>
        ))}
        <Divider />
      </MenuSection>

      {/* 푸터 영역 */}
      <FooterContainer>
        {/* 푸터 링크 */}
        <MenuLinksContainer>
          {[
            { text: '개인정보 약관', onClick: moveToPrivacyPolicy },
            { text: '로그아웃', onClick: openLogoutModal },
            { text: '회원탈퇴', onClick: openMembershipModal },
          ].map((link, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Separator>|</Separator>}
              <FooterText onClick={link.onClick}>{link.text}</FooterText>
            </React.Fragment>
          ))}
        </MenuLinksContainer>

        {/* 사업자 정보 */}
        <BusinessInfoContainer>
          {[
            '(주)마타조 | 대표이사: 정유진',
            '사업자등록번호: 604-11-41401',
            '이메일: matajoktb@gmail.com',
            '© 2025 마타조(MATOAJO) Inc. All rights reserved.',
          ].map((info, index) => (
            <BusinessInfo key={index}>{info}</BusinessInfo>
          ))}
        </BusinessInfoContainer>
      </FooterContainer>

      {/* 토스트 메시지 */}
      <Toast
        message={toastMessage}
        visible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />

      {/* 단일 모달로 통합 */}
      {(isKeeperModalOpen || isMembershipModalOpen || isLogoutModalOpen) && (
        <Modal {...getModalProps()} content={renderModalContent()} />
      )}

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="마이페이지" />
    </Container>
  );
};

export default MyPage;
