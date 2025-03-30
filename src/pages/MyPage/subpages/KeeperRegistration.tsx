import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../../components/layout/Header';
import { registerKeeperTerms } from '../../../services/api/modules/keeper';
import Toast from '../../../components/common/Toast';

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
  width: 375px;
  min-height: calc(100vh - 50px);
  position: relative;
  background: white;
  padding-top: 30px; /* 헤더 높이만큼 패딩 */
  padding-bottom: 100px; /* 버튼 높이만큼 패딩 */
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

  // 약관 내용 보기 (외부 노션 페이지로 이동)
  const openTermsPage = (termType: 'privacy' | 'terms', e: React.MouseEvent) => {
    e.stopPropagation(); // 체크박스 클릭 이벤트 방지

    // 실제 환경에서는 아래 URL을 실제 노션 페이지 URL로 변경
    const urls = {
      privacy: 'https://matajo.notion.site/1b578008bf588075a59cda2817f60ed4',
      terms: 'https://matajo.notion.site/1b578008bf58804ab45cc23edd811165',
    };

    window.open(urls[termType], '_blank');
  };

  // 보관소 작성 페이지로 이동 핸들러
  const handleGoToStorage = async () => {
    if (termsAgreed.privacy && termsAgreed.terms) {
      try {
        setIsLoading(true);

        // API 호출
        await registerKeeperTerms({
          terms_of_service: termsAgreed.terms,
          privacy_policy: termsAgreed.privacy,
        });

        showToast('보관인 등록이 완료되었습니다.');

        // 1초 후 보관소 등록 페이지로 이동
        setTimeout(() => {
          navigate('/storage/register');
        }, 1000);
      } catch (error) {
        console.error('보관인 등록 실패:', error);
        showToast('보관인 등록에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    } else {
      showToast('필수 약관에 동의해주세요.');
    }
  };

  // 홈으로 이동 핸들러
  const handleGoToHome = async () => {
    if (termsAgreed.privacy && termsAgreed.terms) {
      try {
        setIsLoading(true);

        // API 호출
        await registerKeeperTerms({
          terms_of_service: termsAgreed.terms,
          privacy_policy: termsAgreed.privacy,
        });

        showToast('보관인 등록이 완료되었습니다.');

        // 1초 후 메인 페이지로 이동
        setTimeout(() => {
          navigate('/main');
        }, 1000);
      } catch (error) {
        console.error('보관인 등록 실패:', error);
        showToast('보관인 등록에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    } else {
      showToast('필수 약관에 동의해주세요.');
    }
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    // 변경 사항은 로컬 스토리지에 자동 저장 상태이므로 바로 이전 페이지로 이동
    navigate(-1);
  };

  // 다음 버튼 활성화 여부
  const isNextButtonDisabled = !(termsAgreed.privacy && termsAgreed.terms);

  return (
    <>
      <Header title="보관인 등록" showBackButton={true} onBack={handleBack} />

      {/* 토스트 메시지 */}
      <Toast
        message={toastMessage}
        visible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />

      {/* 로딩 표시 */}
      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}

      <Container>
        <PageTitle>
          안심하고 맡길 수 있는
          <br />
          <BrandText>마타조 보관인</BrandText>이 되기 위해
        </PageTitle>

        <Description>아래의 약관을 읽고 동의해주세요</Description>

        <Divider />

        <TermsContainer>
          {/* 약관 전체 동의 */}
          <TermItem onClick={handleAgreeAll}>
            <CheckboxCircle checked={termsAgreed.all} />
            <TermLabel>약관 전체 동의</TermLabel>
          </TermItem>

          {/* 개인정보 수집 및 이용 동의 */}
          <TermItem onClick={() => handleSingleAgree('privacy')}>
            <CheckboxCircle checked={termsAgreed.privacy} />
            <TermText onClick={e => openTermsPage('privacy', e)}>
              개인정보 수집 및 이용 동의
            </TermText>
            <RequiredTag>(필수)</RequiredTag>
          </TermItem>

          {/* 이용약관 동의 */}
          <TermItem onClick={() => handleSingleAgree('terms')}>
            <CheckboxCircle checked={termsAgreed.terms} />
            <TermText onClick={e => openTermsPage('terms', e)}>이용약관 동의</TermText>
            <RequiredTag>(필수)</RequiredTag>
          </TermItem>
        </TermsContainer>

        {/* 버튼 영역 */}
        <ButtonContainer>
          <PrimaryButton disabled={isNextButtonDisabled} onClick={handleGoToStorage}>
            바로 보관소 작성하러가기
          </PrimaryButton>

          <SecondaryButton disabled={isNextButtonDisabled} onClick={handleGoToHome}>
            보관인 동의 완료! 홈으로 이동하기
          </SecondaryButton>
        </ButtonContainer>
      </Container>
    </>
  );
};

export default KeeperRegistration;
