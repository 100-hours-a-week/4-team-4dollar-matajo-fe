import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../../components/layout/Header';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#5E5CFD',
  background: '#F5F5FF',
  textDark: '#464646',
  textGray: '#909090',
  textBlack: '#000000',
  buttonDisabled: '#D9D9D9',
};

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 375px;
  height: calc(100vh - 50px);
  position: relative;
  background: white;
  padding-top: 30px; /* 헤더 높이만큼 패딩 */
  padding-bottom: 0px;
`;

// 로고 텍스트
const LogoText = styled.div`
  margin-top: 40px;
  text-align: center;
  color: black;
  font-size: 42px;
  font-family: 'Hakgyoansim Allimjang TTF', sans-serif;
  font-weight: 600;
  letter-spacing: 0.04px;
`;

// 안내 텍스트 컨테이너
const InfoTextContainer = styled.div`
  margin: 30px 25px;
`;

// 안내 텍스트 스타일
const InfoText = styled.p`
  color: ${THEME.textGray};
  font-size: 13px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 350;
  line-height: 1.5;
  letter-spacing: 0.01px;
  word-wrap: break-word;
  margin-bottom: 10px;
`;

// 강조 텍스트 스타일
const BoldText = styled.span`
  font-weight: 700;
  color: ${THEME.textGray};
`;

// 약관 항목 컨테이너
const TermsContainer = styled.div`
  margin: 0 25px;
`;

// 약관 항목 스타일
const TermItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
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

// 구분선
const Divider = styled.div`
  width: 325px;
  height: 1px;
  background-color: #d9d9d9;
  margin: 20px auto;
`;

// 다음 버튼
const NextButton = styled.button<{ disabled: boolean }>`
  width: 349px;
  height: 47px;
  position: fixed;
  left: 13px;
  bottom: 30px;
  background: ${props => (props.disabled ? THEME.buttonDisabled : THEME.primary)};
  border-radius: 15px;
  border: none;
  color: white;
  font-size: 14px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  letter-spacing: 0.01px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
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

  // 다음 버튼 핸들러
  const handleNext = () => {
    if (termsAgreed.privacy && termsAgreed.terms) {
      navigate('/registration/step1');
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

      <Container>
        <LogoText>MATAJO</LogoText>

        <InfoTextContainer>
          <InfoText>
            안심하고 맡길 수 있는 <BoldText>마타조 보관인</BoldText>이 되기 위해
            <br />
            아래의 약관을 읽고 동의해주세요
          </InfoText>
          <InfoText>
            마타조 보관인은 <BoldText>하나 이상의 보관소</BoldText>를
            <br />
            등록해야 승인 받을 수 있어요!
          </InfoText>
        </InfoTextContainer>

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
            <TermLabel onClick={e => openTermsPage('privacy', e)}>
              개인정보 수집 및 이용 동의 (필수)
            </TermLabel>
          </TermItem>

          {/* 이용약관 동의 */}
          <TermItem onClick={() => handleSingleAgree('terms')}>
            <CheckboxCircle checked={termsAgreed.terms} />
            <TermLabel onClick={e => openTermsPage('terms', e)}>이용약관 동의 (필수)</TermLabel>
          </TermItem>
        </TermsContainer>

        {/* 다음 버튼 */}
        <NextButton disabled={isNextButtonDisabled} onClick={handleNext}>
          다음
        </NextButton>
      </Container>
    </>
  );
};

export default KeeperRegistration;
