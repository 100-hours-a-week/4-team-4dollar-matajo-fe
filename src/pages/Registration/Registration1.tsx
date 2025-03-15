import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#5E5CFD',
  background: '#F5F5FF',
  lightGray: '#EFEFEF',
  darkText: '#464646',
  redText: '#FF5050',
  grayText: '#6F6F6F',
  borderColor: '#E0E0E0',
  white: '#FFFFFF',
};

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 375px;
  // height: calc(100vh - 76px); /* 네비게이션 바 높이 제외 */
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 116px; /* 하단 네비게이션 높이만큼 마진 */
  padding-top: 47px; /* 헤더 높이만큼 패딩 */
`;

// 프로그레스 바 컨테이너
const ProgressContainer = styled.div`
  margin: 20px 22px;
  position: relative;
`;

// 프로그레스 배경
const ProgressBackground = styled.div`
  width: 332px;
  height: 12px;
  background: ${THEME.lightGray};
  border-radius: 7px;
`;

// 프로그레스 완료 부분
const ProgressFill = styled.div`
  width: 111px; /* 1/3 진행 */
  height: 12px;
  background: ${THEME.primary};
  border-top-left-radius: 7px;
  border-bottom-left-radius: 7px;
`;

// 프로그레스 텍스트
const ProgressText = styled.span`
  position: absolute;
  right: 0;
  top: -15px;
  color: ${THEME.primary};
  font-size: 10px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  letter-spacing: 0.25px;
`;

// 폼 컨테이너
const FormContainer = styled.div`
  padding: 0 10px;
  margin-top: 30px;
`;

// 입력 필드 레이블
const InputLabel = styled.div`
  margin-bottom: 8px;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.01px;
  color: ${THEME.grayText};
`;

// 필수 표시 (*)
const RequiredMark = styled.span`
  color: ${THEME.redText};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  letter-spacing: 0.01px;
`;

// 입력 필드
const InputField = styled.input`
  width: 321px;
  height: 40px;
  border-radius: 15px;
  border: 0.5px solid ${THEME.primary};
  padding: 0 15px;
  margin-bottom: 18px;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  &:focus {
    outline: none;
    border-color: ${THEME.primary};
  }
`;

// 헬퍼 텍스트
const HelperText = styled.div`
  color: ${THEME.redText};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 350;
  letter-spacing: 0.01px;
  margin-bottom: 3px;
`;

// 텍스트 영역
const TextArea = styled.textarea`
  width: 321px;
  height: 171px;
  border-radius: 15px;
  border: 0.5px solid ${THEME.primary};
  padding: 15px;
  margin-bottom: 18px;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  resize: none;
  &:focus {
    outline: none;
    border-color: ${THEME.primary};
  }
`;

// 다음 버튼
const NextButton = styled.button`
  width: 349px;
  height: 47px;
  position: absolute;
  left: 13px;
  bottom: 30px;
  background: ${THEME.primary};
  border-radius: 15px;
  border: none;
  color: ${THEME.white};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.01px;
  cursor: pointer;
`;

const Registration1: React.FC = () => {
  // 라우터 네비게이션 훅
  const navigate = useNavigate();
  // 폼 상태 관리
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [price, setPrice] = useState('');

  // 글자수 제한
  const DESCRIPTION_MAX_LENGTH = 15;
  const DETAILS_MAX_LENGTH = 500;

  // 폼 제출 핸들러
  const handleSubmit = () => {
    // 필수 입력값 검증
    if (!address || !description || !details || !price) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    // 다음 단계로 이동 로직 - 입력 데이터를 state로 전달
    const formData = { address, description, details, price };
    console.log('다음 단계로 이동', formData);
    // routes/index.tsx에 '/registration/step2' 경로가 설정되어 있어야 함
    navigate('/registration/step2', { state: formData });
  };

  return (
    <>
      {/* 상단 헤더 */}
      <Header title="보관소 등록" showBackButton={true} />

      <Container>
        {/* 프로그레스 바 */}
        <ProgressContainer>
          <ProgressBackground>
            <ProgressFill />
          </ProgressBackground>
          <ProgressText>1/3</ProgressText>
        </ProgressContainer>

        {/* 폼 컨테이너 */}
        <FormContainer>
          {/* 주소 입력 */}
          <InputLabel>
            주소를 입력해 주세요 <RequiredMark>*</RequiredMark>
          </InputLabel>
          <HelperText>헬퍼 텍스트입니다.</HelperText>
          <InputField
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="주소를 입력해주세요"
          />

          {/* 한줄 소개 */}
          <InputLabel>
            공간 한줄 소개 <RequiredMark>*</RequiredMark>
          </InputLabel>
          <HelperText>헬퍼 텍스트입니다.</HelperText>
          <InputField
            type="text"
            value={description}
            onChange={e => {
              if (e.target.value.length <= DESCRIPTION_MAX_LENGTH) {
                setDescription(e.target.value);
              }
            }}
            placeholder="공간을 한줄로 작성해주세요 (최대 15글자)"
            maxLength={DESCRIPTION_MAX_LENGTH}
          />

          {/* 상세 내용 */}
          <InputLabel>
            내용을 입력해주세요 <RequiredMark>*</RequiredMark>
          </InputLabel>
          <HelperText>헬퍼 텍스트입니다.</HelperText>
          <TextArea
            value={details}
            onChange={e => {
              if (e.target.value.length <= DETAILS_MAX_LENGTH) {
                setDetails(e.target.value);
              }
            }}
            placeholder="장소에 대한 설명을 자세히 입력해주세요.
          보관 장소 설명 (보관장소 크기, 환경)
          유의사항 (보관기간, 보관 시 주의해야할 점)
          보관이 안되는 품목 (ex. 귀중품, 가구)
          기타 (자율적으로 하고 싶은말)
          *최대 500글자까지 입력 가능합니다*"
            maxLength={DETAILS_MAX_LENGTH}
          />

          {/* 가격 입력 */}
          <InputLabel>
            희망 가격 입력 <RequiredMark>*</RequiredMark>
          </InputLabel>
          <HelperText>헬퍼 텍스트입니다.</HelperText>
          <InputField
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="가격을 입력해주세요 (숫자만 입력해주세요)"
          />
        </FormContainer>
        {/* 다음 버튼 */}
        <NextButton onClick={handleSubmit}>다음</NextButton>
      </Container>

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="보관소" />
    </>
  );
};

export default Registration1;
