import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import Modal from '../../components/common/Modal';

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
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 136px; /* 하단 네비게이션 높이만큼 마진 */
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
const InputField = styled.input<{ isError?: boolean; isFocused?: boolean }>`
  width: 321px;
  height: 40px;
  border-radius: 15px;
  border: 0.5px solid
    ${props => {
      if (props.isError) return THEME.redText;
      if (props.isFocused) return THEME.primary;
      return THEME.grayText;
    }};
  padding: 0 15px;
  margin-bottom: 18px;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  &:focus {
    outline: none;
    border-color: ${props => (props.isError ? THEME.redText : THEME.primary)};
  }
`;

// 헬퍼 텍스트
const HelperText = styled.div<{ visible?: boolean }>`
  color: ${THEME.redText};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 350;
  letter-spacing: 0.01px;
  margin-bottom: 3px;
  visibility: ${props => (props.visible ? 'visible' : 'hidden')};
  height: ${props => (props.visible ? 'auto' : '0')};
  margin-bottom: ${props => (props.visible ? '3px' : '0')};
  transition:
    visibility 0.2s,
    height 0.2s,
    margin-bottom 0.2s;
`;

// 텍스트 영역
const TextArea = styled.textarea<{ isError?: boolean; isFocused?: boolean }>`
  width: 321px;
  height: 171px;
  border-radius: 15px;
  border: 0.5px solid
    ${props => {
      if (props.isError) return THEME.redText;
      if (props.isFocused) return THEME.primary;
      return THEME.grayText;
    }};
  padding: 15px;
  margin-bottom: 18px;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  resize: none;
  &:focus {
    outline: none;
    border-color: ${props => (props.isError ? THEME.redText : THEME.primary)};
  }
`;

// 다음 버튼
const NextButton = styled.button`
  width: 349px;
  height: 47px;
  position: absolute;
  left: 13px;
  bottom: 90px;
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

// 폼 데이터 타입 정의
interface FormData {
  address: string;
  description: string;
  details: string;
  price: string;
}

// 오류 상태 타입 정의
interface ErrorState {
  address: string;
  description: string;
  details: string;
  price: string;
}

const Registration1: React.FC = () => {
  // 라우터 네비게이션 훅
  const navigate = useNavigate();

  // 폼 상태 관리
  const [formData, setFormData] = useState<FormData>({
    address: '',
    description: '',
    details: '',
    price: '',
  });

  // 에러 상태 관리
  const [errors, setErrors] = useState<ErrorState>({
    address: '',
    description: '',
    details: '',
    price: '',
  });

  // 포커스 상태 관리
  const [focused, setFocused] = useState<Record<string, boolean>>({
    address: false,
    description: false,
    details: false,
    price: false,
  });

  // 백 버튼 모달 상태
  const [isBackModalOpen, setIsBackModalOpen] = useState(false);

  // 글자수 제한
  const DESCRIPTION_MAX_LENGTH = 15;
  const DETAILS_MAX_LENGTH = 500;

  // 폼 데이터 불러오기 (로컬 스토리지)
  useEffect(() => {
    const savedData = localStorage.getItem('registration_step1');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // 입력 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // 글자수 제한 처리
    if (name === 'description' && value.length > DESCRIPTION_MAX_LENGTH) {
      return;
    }

    if (name === 'details' && value.length > DETAILS_MAX_LENGTH) {
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    // 입력 시 해당 필드의 에러 메시지 초기화
    setErrors(prev => ({ ...prev, [name]: '' }));

    // 로컬 스토리지에 데이터 저장 (자동 저장)
    localStorage.setItem(
      'registration_step1',
      JSON.stringify({
        ...formData,
        [name]: value,
      }),
    );
  };

  // 포커스 핸들러
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setFocused(prev => ({ ...prev, [name]: true }));
  };

  // 블러 핸들러
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setFocused(prev => ({ ...prev, [name]: false }));
  };

  // 유효성 검사 함수
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      address: '',
      description: '',
      details: '',
      price: '',
    };

    // 주소 검사
    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요.';
      isValid = false;
    }

    // 설명 검사
    if (!formData.description.trim()) {
      newErrors.description = '공간 한줄 소개를 입력해주세요.';
      isValid = false;
    } else if (formData.description.length > DESCRIPTION_MAX_LENGTH) {
      newErrors.description = `최대 ${DESCRIPTION_MAX_LENGTH}자까지 입력 가능합니다.`;
      isValid = false;
    }

    // 상세 내용 검사 (필수 항목)
    if (!formData.details.trim()) {
      newErrors.details = '내용을 입력해주세요.';
      isValid = false;
    } else if (formData.details.length > DETAILS_MAX_LENGTH) {
      newErrors.details = `최대 ${DETAILS_MAX_LENGTH}자까지 입력 가능합니다.`;
      isValid = false;
    }

    // 가격 검사
    if (!formData.price.trim()) {
      newErrors.price = '가격을 입력해주세요.';
      isValid = false;
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = '유효한 가격을 입력해주세요.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    // 입력 데이터가 있는지 확인
    const hasData = Object.values(formData).some(value => value.trim() !== '');

    if (hasData) {
      // 데이터가 있으면 모달 표시
      setIsBackModalOpen(true);
    } else {
      // 데이터가 없으면 바로 이전 페이지로
      navigate(-1);
    }
  };

  // 모달 확인 버튼 핸들러 (나가기)
  const handleConfirmExit = () => {
    // 로컬 스토리지 데이터 삭제
    localStorage.removeItem('registration_step1');
    localStorage.removeItem('registration_step2');
    localStorage.removeItem('registration_step3');
    navigate(-1);
  };

  // 폼 제출 핸들러
  const handleSubmit = () => {
    // 유효성 검사
    if (!validateForm()) {
      return;
    }

    // 다음 단계로 이동 로직 - 입력 데이터를 state로 전달
    console.log('다음 단계로 이동', formData);
    navigate('/registration/step2', { state: formData });
  };

  // 모달 내용 컴포넌트
  const backModalContent = (
    <>
      <div style={{ fontSize: '24px', textAlign: 'center', marginBottom: '10px' }}>😮</div>
      <div style={{ textAlign: 'center' }}>
        <span style={{ color: '#1e1e1e', fontSize: '18px', fontWeight: 700 }}>
          페이지에서 나가시나요?
        </span>
        <br />
        <br />
        <span style={{ color: 'black', fontSize: '14px' }}>진행상황은 저장되지 않습니다.</span>
      </div>
    </>
  );

  return (
    <>
      {/* 뒤로가기 모달 */}
      <Modal
        isOpen={isBackModalOpen}
        onClose={() => setIsBackModalOpen(false)}
        content={backModalContent}
        cancelText="취소"
        confirmText="나가기"
        onCancel={() => setIsBackModalOpen(false)}
        onConfirm={handleConfirmExit}
      />

      {/* 상단 헤더 */}
      <Header title="보관소 등록" showBackButton={true} onBack={handleBack} />

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
          <HelperText visible={!!errors.address}>
            {errors.address || '헬퍼 텍스트입니다.'}
          </HelperText>
          <InputField
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="주소를 입력해주세요"
            isError={!!errors.address}
            isFocused={focused.address}
          />

          {/* 한줄 소개 */}
          <InputLabel>
            공간 한줄 소개 <RequiredMark>*</RequiredMark>
          </InputLabel>
          <HelperText visible={!!errors.description}>
            {errors.description || '헬퍼 텍스트입니다.'}
          </HelperText>
          <InputField
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="공간을 한줄로 작성해주세요 (최대 15글자)"
            maxLength={DESCRIPTION_MAX_LENGTH}
            isError={!!errors.description}
            isFocused={focused.description}
          />

          {/* 상세 내용 */}
          <InputLabel>
            내용을 입력해주세요 <RequiredMark>*</RequiredMark>
          </InputLabel>
          <HelperText visible={!!errors.details}>
            {errors.details || '헬퍼 텍스트입니다.'}
          </HelperText>
          <TextArea
            name="details"
            value={formData.details}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="장소에 대한 설명을 자세히 입력해주세요.
          보관 장소 설명 (보관장소 크기, 환경)
          유의사항 (보관기간, 보관 시 주의해야할 점)
          보관이 안되는 품목 (ex. 귀중품, 가구)
          기타 (자율적으로 하고 싶은말)
          *최대 500글자까지 입력 가능합니다*"
            maxLength={DETAILS_MAX_LENGTH}
            isError={!!errors.details}
            isFocused={focused.details}
          />

          {/* 가격 입력 */}
          <InputLabel>
            희망 가격 입력 <RequiredMark>*</RequiredMark>
          </InputLabel>
          <HelperText visible={!!errors.price}>{errors.price || '헬퍼 텍스트입니다.'}</HelperText>
          <InputField
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="가격을 입력해주세요 (숫자만 입력해주세요)"
            isError={!!errors.price}
            isFocused={focused.price}
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
