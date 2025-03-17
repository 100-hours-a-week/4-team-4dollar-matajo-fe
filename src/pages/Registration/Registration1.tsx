import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/layout/Header';

// 모달 스타일 컴포넌트
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  width: 300px;
  height: 150px;
  position: relative;
  background: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.span`
  color: #1e1e1e;
  font-size: 18px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  text-align: center;
  margin-top: 5px;
`;

const ModalDescription = styled.span`
  color: black;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  text-align: center;
  margin-top: 5px;
`;

const EmoticonContainer = styled.div`
  font-size: 24px;
  margin-top: 5px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 10px;
`;

const CancelButton = styled.button`
  width: 130px;
  height: 32px;
  background: #d7d7ff;
  border-radius: 4px;
  border: none;
  color: #5b5a5d;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #c7c7ff;
  }
`;

const ConfirmButton = styled.button`
  width: 130px;
  height: 32px;
  background: #010048;
  border-radius: 4px;
  border: none;
  color: white;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #01002e;
  }
`;

// 내부 모달 컴포넌트
interface BackConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const BackConfirmModal: React.FC<BackConfirmModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onCancel}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <EmoticonContainer>😮</EmoticonContainer>
        <div>
          <ModalTitle>페이지에서 나가시나요?</ModalTitle>
          <br />
          <ModalDescription>진행상황은 저장되지 않습니다.</ModalDescription>
        </div>
        <ButtonContainer>
          <CancelButton onClick={onCancel}>취소</CancelButton>
          <ConfirmButton onClick={onConfirm}>나가기</ConfirmButton>
        </ButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

// 공통 스타일 정의
const RegistrationContainer = styled.div`
  width: 100%;
  max-width: 375px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: #f5f5ff;
  padding: 0;
  position: relative;
`;

// 테마 컬러 상수 정의
const THEME = {
  primary: '#5E5CFD',
  background: '#F5F5FF',
  lightGray: '#EFEFEF',
  darkText: '#464646',
  redText: '#FF5050',
  grayText: '#868686',
  borderColor: '#D9D9D9',
  white: '#FFFFFF',
  black: '#000000',
};

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 375px;
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 116px;
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
  width: 110px; /* 1/3 진행 */
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

// 섹션 제목
const SectionTitle = styled.h3`
  color: ${THEME.black};
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  line-height: 19.21px;
  margin: 30px 0 15px 25px;
`;

// 입력 필드 컨테이너
const InputContainer = styled.div`
  margin: 0 25px 20px;
`;

// 입력 필드 라벨
const InputLabel = styled.label`
  display: block;
  color: ${THEME.grayText};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  margin-bottom: 5px;
`;

// 텍스트 입력 필드
const TextInput = styled.input`
  width: 100%;
  height: 45px;
  padding: 0 15px;
  border: 1px solid ${THEME.borderColor};
  border-radius: 5px;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 400;

  &:focus {
    outline: none;
    border-color: ${THEME.primary};
  }
`;

// 텍스트 에어리어
const TextArea = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 15px;
  border: 1px solid ${THEME.borderColor};
  border-radius: 5px;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
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
  font-size: 15px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  cursor: pointer;
`;

// 폼 데이터 타입 정의
interface FormData {
  address: string;
  description: string;
  details: string;
  price: string;
}

// Registration1 컴포넌트
const Registration1: React.FC = () => {
  const navigate = useNavigate();

  // 폼 상태 관리
  const [formData, setFormData] = useState<FormData>({
    address: '',
    description: '',
    details: '',
    price: '',
  });

  // 백 버튼 모달 상태
  const [isBackModalOpen, setIsBackModalOpen] = useState(false);

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
    setFormData(prev => ({ ...prev, [name]: value }));

    // 로컬 스토리지에 데이터 저장 (자동 저장)
    localStorage.setItem(
      'registration_step1',
      JSON.stringify({
        ...formData,
        [name]: value,
      }),
    );
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
    // 로컬 스토리지 데이터 유지 (다시 돌아올 수 있으므로)
    navigate(-1);
  };

  // 모달 취소 버튼 핸들러
  const handleCancelExit = () => {
    setIsBackModalOpen(false);
  };

  // 다음 단계로 이동 핸들러
  const handleNext = () => {
    // 필수 입력값 검증
    if (!formData.address) {
      alert('주소를 입력해주세요.');
      return;
    }

    if (!formData.description) {
      alert('보관소 설명을 입력해주세요.');
      return;
    }

    if (!formData.price) {
      alert('가격을 입력해주세요.');
      return;
    }

    // 다음 단계로 이동
    navigate('/registration/step2', { state: formData });
  };

  return (
    <>
      {/* 뒤로가기 모달 */}
      <BackConfirmModal
        isOpen={isBackModalOpen}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />

      {/* 헤더 */}
      <Header title="보관소 등록" showBackButton={true} onBack={handleBack} />

      <RegistrationContainer>
        <Container>
          {/* 프로그레스 바 */}
          <ProgressContainer>
            <ProgressBackground>
              <ProgressFill />
            </ProgressBackground>
            <ProgressText>1/3</ProgressText>
          </ProgressContainer>

          {/* 주소 입력 */}
          <SectionTitle>주소</SectionTitle>
          <InputContainer>
            <InputLabel>주소 입력</InputLabel>
            <TextInput
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="주소를 입력해주세요"
            />
          </InputContainer>

          {/* 보관소 설명 */}
          <SectionTitle>보관소 설명</SectionTitle>
          <InputContainer>
            <InputLabel>보관소 설명 입력</InputLabel>
            <TextInput
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="보관소 설명을 입력해주세요"
            />
          </InputContainer>

          {/* 상세 정보 */}
          <SectionTitle>상세 정보</SectionTitle>
          <InputContainer>
            <InputLabel>상세 정보 입력 (선택)</InputLabel>
            <TextArea
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              placeholder="보관소에 대한 상세 정보를 입력해주세요 (선택사항)"
            />
          </InputContainer>

          {/* 가격 정보 */}
          <SectionTitle>가격</SectionTitle>
          <InputContainer>
            <InputLabel>가격 입력</InputLabel>
            <TextInput
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="가격을 입력해주세요"
            />
          </InputContainer>

          {/* 다음 버튼 */}
          <NextButton onClick={handleNext}>다음</NextButton>
        </Container>
      </RegistrationContainer>
    </>
  );
};

export default Registration1;
