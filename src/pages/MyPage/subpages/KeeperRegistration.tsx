import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../../components/layout/Header';
import { registerKeeperTerms } from '../../../services/api/modules/keeper';
import Toast from '../../../components/common/Toast';
import { updateUserRole, getRole } from '../../../utils/formatting/decodeJWT';
import { ROUTES } from '../../../constants/routes';
import { saveToken } from '../../../utils/api/authUtils';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#5E5CFD',
  background: '#F5F5FF',
  textDark: '#464646',
  textGray: '#909090',
  textBlack: '#000000',
  buttonDisabled: '#D9D9D9',
  error: '#FF3B30',
};

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 100%;
  max-width: 480px;
  min-height: calc(100vh - 50px);
  margin: 0 auto;
  position: relative;
  background: white;
  padding-top: 30px; /* 헤더 높이만큼 패딩 */
  padding-bottom: 120px; /* 버튼 높이만큼 패딩 */
`;

// 페이지 타이틀
const PageTitle = styled.div`
  margin: 20px 25px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 600;
  font-size: 22px;
  line-height: 1.4;
  color: ${THEME.textBlack};
`;

// 회사명 강조 텍스트
const BrandText = styled.span`
  font-weight: 700;
  color: ${THEME.textBlack};
`;

// 설명 텍스트
const Description = styled.p`
  margin: 10px 25px 30px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  color: ${THEME.textGray};
`;

// 구분선
const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #d9d9d9;
  margin: 20px 0;
`;

// 약관 항목 컨테이너
const TermsContainer = styled.div`
  margin: 30px 25px;
`;

// 약관 항목 스타일
const TermItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  cursor: pointer;
`;

// 체크박스 원형 스타일
const CheckboxCircle = styled.div<{ checked: boolean }>`
  width: 31px;
  height: 31px;
  border-radius: 50%;
  border: 1px solid #d9d9d9;
  margin-right: 15px;
  display: flex;
  justify-content: center;
  align-items: center;

  /* 체크 표시 */
  &::after {
    content: '';
    display: ${props => (props.checked ? 'block' : 'none')};
    width: 15px;
    height: 8px;
    border-left: 2px solid ${THEME.primary};
    border-bottom: 2px solid ${THEME.primary};
    transform: rotate(-45deg) translate(1px, -2px);
  }
`;

// 약관 라벨 스타일
const TermLabel = styled.div`
  color: ${THEME.textBlack};
  font-size: 17px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 500;
  letter-spacing: 0.02px;
`;

// 약관 텍스트 스타일
const TermText = styled.span`
  color: ${THEME.textBlack};
  font-size: 17px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 400;
`;

// 필수 태그 스타일
const RequiredTag = styled.span`
  color: ${THEME.primary};
  font-size: 15px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 500;
  margin-left: 5px;
`;

// 버튼 컨테이너
const ButtonContainer = styled.div`
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 15px 0;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  max-width: 480px;
  margin: 0 auto;
`;

// 보관소 등록 버튼
const PrimaryButton = styled.button<{ disabled: boolean }>`
  width: 90%;
  height: 52px;
  margin: 0 auto;
  display: block;
  background: ${props => (props.disabled ? THEME.buttonDisabled : THEME.primary)};
  border-radius: 15px;
  border: none;
  color: white;
  font-size: 16px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  letter-spacing: 0.01px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
`;

// 홈으로 이동 버튼
const SecondaryButton = styled.button<{ disabled: boolean }>`
  width: 90%;
  height: 52px;
  margin: 10px auto 0;
  display: block;
  background: ${props => (props.disabled ? THEME.buttonDisabled : '#CCCCCC')};
  border-radius: 15px;
  border: none;
  color: white;
  font-size: 16px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  letter-spacing: 0.01px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
`;

// 로딩 인디케이터
const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid ${THEME.background};
  border-top: 5px solid ${THEME.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const KeeperRegistration: React.FC = () => {
  // 네비게이션 훅
  const navigate = useNavigate();

  // 약관 동의 상태
  const [termsAgreed, setTermsAgreed] = useState({
    all: false,
    privacy: false,
    terms: false,
  });

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // 토스트 메시지 상태
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  // 페이지 접근 시 토큰 확인 및 역할 확인
  useEffect(() => {
    checkUserRole();

    // 토큰 변경 리스너 등록
    const handleTokenChange = () => {
      console.log('토큰 또는 역할 변경 감지됨. 사용자 역할 재확인');
      checkUserRole();
    };

    // 역할 변경 이벤트 리스너 등록
    window.addEventListener('USER_ROLE_CHANGED', handleTokenChange);

    return () => {
      window.removeEventListener('USER_ROLE_CHANGED', handleTokenChange);
    };
  }, []);

  // 사용자 역할 확인 함수
  const checkUserRole = () => {
    try {
      // 로컬 스토리지에서 토큰 가져오기
      const token = localStorage.getItem('accessToken');

      if (token) {
        // 토큰에서 역할 정보 추출
        const role = getRole(token);

        console.log('현재 사용자 역할:', role);

        // 이미 보관인(role === "2")인 경우 보관소 등록 페이지로 리다이렉트
        if (role === '2') {
          console.log('이미 보관인 역할을 가진 사용자입니다. 보관소 등록 페이지로 이동합니다.');
          navigate(`${ROUTES.STORAGE_REGISTER}`);
        }
      }
    } catch (error) {
      console.error('사용자 역할 확인 중 오류:', error);
    }
  };

  // 토스트 메시지 표시 함수
  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);

    // 3초 후 토스트 메시지 숨기기
    setTimeout(() => {
      setIsToastVisible(false);
    }, 3000);
  };

  // 약관 전체 동의 핸들러
  const handleAgreeAll = () => {
    const newValue = !termsAgreed.all;
    setTermsAgreed({
      all: newValue,
      privacy: newValue,
      terms: newValue,
    });
  };

  // 개별 약관 동의 핸들러
  const handleSingleAgree = (term: 'privacy' | 'terms') => {
    const newTermsState = {
      ...termsAgreed,
      [term]: !termsAgreed[term],
    };

    // all 상태 업데이트
    newTermsState.all = newTermsState.privacy && newTermsState.terms;

    setTermsAgreed(newTermsState);
  };

  // 약관 페이지 열기 (구현 예정)
  const openTermsPage = (termType: 'privacy' | 'terms', e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 요소 클릭 이벤트 방지

    // 약관 페이지로 이동하거나 모달로 표시 (미구현)
    showToast(`약관 내용은 준비 중입니다.`);
  };

  // 보관소 작성 페이지로 이동
  const handleGoToStorage = async () => {
    try {
      if (!termsAgreed.terms || !termsAgreed.privacy) {
        showToast('모든 약관에 동의해주세요.');
        return;
      }

      setIsLoading(true);

      // API 호출 데이터 준비
      const termsData = {
        terms_of_service: termsAgreed.terms,
        privacy_policy: termsAgreed.privacy,
      };

      console.log('보관인 등록 요청 시작', termsData);

      // 보관인 등록 API 호출
      const response = await registerKeeperTerms(termsData);

      // 성공 응답에 새 토큰이 포함된 경우 역할 업데이트
      if (response.success) {
        console.log('새 액세스 토큰 저장:', response.data.accessToken);

        // 기존 토큰을 새 토큰으로 대체
        saveToken(response.data.accessToken);
        console.log('로컬스토리지에 새 토큰 저장 완료');

        // 직접 updateUserRole 함수 가져와서 호출
        updateUserRole(response.data?.accessToken);
        console.log('사용자 역할 업데이트 완료');

        // 역할 변경 이벤트 발생
        window.dispatchEvent(
          new CustomEvent('USER_ROLE_CHANGED', {
            detail: { role: 2 }, // 보관인 역할을 명시적으로 설정
          }),
        );
        console.log('사용자 역할 변경 이벤트 발생 완료');
      }

      console.log('보관인 등록 응답 성공:', response);
      console.log('새 토큰이 있는지 확인:', !!response.data?.accessToken);

      if (response.success) {
        // 토큰이 성공적으로 저장되었는지 확인
        const savedToken = localStorage.getItem('accessToken');
        console.log(
          '저장된 토큰 확인 (앞부분):',
          savedToken ? savedToken.substring(0, 20) + '...' : '없음',
        );

        // 토스트 메시지 표시
        showToast('보관인 등록이 완료되었습니다.');

        // 보관소 등록 페이지로 이동
        setTimeout(() => {
          console.log('보관소 등록 페이지로 이동합니다.');
          navigate('/storages/register');
        }, 1000);
      } else {
        showToast(response.message || '보관인 등록에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('보관인 등록 처리 오류:', error);

      // 상세 에러 정보 출력
      if (error.response) {
        console.error('오류 응답 데이터:', error.response.data);
        console.error('오류 상태 코드:', error.response.status);
      }

      showToast('보관인 등록 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 홈으로 이동
  const handleGoToHome = async () => {
    try {
      if (!termsAgreed.terms || !termsAgreed.privacy) {
        showToast('모든 약관에 동의해주세요.');
        return;
      }

      setIsLoading(true);

      // API 호출 데이터 준비
      const termsData = {
        terms_of_service: termsAgreed.terms,
        privacy_policy: termsAgreed.privacy,
      };

      console.log('보관인 등록 요청 시작 (홈으로 이동)', termsData);

      // 보관인 등록 API 호출
      const response = await registerKeeperTerms(termsData);

      // 성공 응답에 새 토큰이 포함된 경우 역할 업데이트
      if (response.success) {
        console.log('새 액세스 토큰 저장:', response.data.accessToken);

        // 기존 토큰을 새 토큰으로 대체
        saveToken(response.data.accessToken);
        console.log('로컬스토리지에 새 토큰 저장 완료');

        // 직접 updateUserRole 함수 가져와서 호출
        updateUserRole(response.data?.accessToken);
        console.log('사용자 역할 업데이트 완료');

        // 역할 변경 이벤트 발생
        window.dispatchEvent(
          new CustomEvent('USER_ROLE_CHANGED', {
            detail: { role: 2 }, // 보관인 역할을 명시적으로 설정
          }),
        );
        console.log('사용자 역할 변경 이벤트 발생 완료');
      }

      console.log('보관인 등록 응답 성공 (홈으로 이동):', response);
      console.log('새 토큰이 있는지 확인:', !!response.data?.accessToken);

      if (response.success) {
        // 토큰이 성공적으로 저장되었는지 확인
        const savedToken = localStorage.getItem('accessToken');
        console.log(
          '저장된 토큰 확인 (앞부분):',
          savedToken ? savedToken.substring(0, 20) + '...' : '없음',
        );

        // 토스트 메시지 표시
        showToast('보관인 등록이 완료되었습니다.');

        // 홈으로 이동
        setTimeout(() => {
          console.log('홈 페이지로 이동합니다.');
          navigate('/');
        }, 1000);
      } else {
        showToast(response.message || '보관인 등록에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('보관인 등록 처리 오류 (홈으로 이동):', error);

      // 상세 에러 정보 출력
      if (error.response) {
        console.error('오류 응답 데이터:', error.response.data);
        console.error('오류 상태 코드:', error.response.status);
      }

      showToast('보관인 등록 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 뒤로 가기
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Container>
      <Header title="보관인 등록" onBack={handleBack} />

      <PageTitle>
        <BrandText>마타조</BrandText>의 보관인이 되어보세요
      </PageTitle>

      <Description>
        보관인 약관에 동의하시면 보관소를 등록하고 관리할 수 있습니다. 보관인 등록 후에는 취소할 수
        없으니 신중하게 결정해주세요.
      </Description>

      <Divider />

      <TermsContainer>
        {/* 전체 동의 */}
        <TermItem onClick={handleAgreeAll}>
          <CheckboxCircle checked={termsAgreed.all} />
          <TermLabel>모든 약관에 동의합니다</TermLabel>
        </TermItem>

        {/* 이용약관 동의 */}
        <TermItem onClick={() => handleSingleAgree('terms')}>
          <CheckboxCircle checked={termsAgreed.terms} />
          <TermLabel>
            <TermText>보관인 이용약관 동의</TermText>
            <RequiredTag>(필수)</RequiredTag>
          </TermLabel>
        </TermItem>

        {/* 개인정보 처리방침 동의 */}
        <TermItem onClick={() => handleSingleAgree('privacy')}>
          <CheckboxCircle checked={termsAgreed.privacy} />
          <TermLabel>
            <TermText>개인정보 처리방침 동의</TermText>
            <RequiredTag>(필수)</RequiredTag>
          </TermLabel>
        </TermItem>
      </TermsContainer>

      <ButtonContainer>
        <PrimaryButton disabled={!termsAgreed.all || isLoading} onClick={handleGoToStorage}>
          보관소 작성하러가기
        </PrimaryButton>

        <SecondaryButton disabled={!termsAgreed.all || isLoading} onClick={handleGoToHome}>
          홈으로 이동하기
        </SecondaryButton>
      </ButtonContainer>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}

      {/* 토스트 메시지 */}
      <Toast
        message={toastMessage}
        visible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </Container>
  );
};

export default KeeperRegistration;
