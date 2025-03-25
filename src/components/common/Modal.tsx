import React from 'react';
import styled from 'styled-components';

// 모달 컨테이너 - 화면 전체를 덮는 반투명 배경
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

// 모달 내용 컨테이너
const ModalContainer = styled.div`
  width: 80%;
  max-width: 327px;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  position: relative;
  margin: 0 auto;
`;

// 모달 텍스트 컨테이너
const ModalContent = styled.div`
  text-align: center;
  margin-bottom: 20px;
  padding: 10px 0;
`;

// 모달 버튼 컨테이너
const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

// 모달 버튼 공통 스타일
const Button = styled.button`
  flex: 1;
  padding: 10px 0;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
`;

// 취소 버튼
const CancelButton = styled(Button)`
  background-color: #f2f2f2;
  color: #464646;
  border: none;

  &:hover {
    background-color: #e5e5e5;
  }
`;

// 확인 버튼 - 원래 스타일로 돌려놓음 (보라색 배경, 흰색 텍스트)
const ConfirmButton = styled(Button)`
  background-color: #3a00e5;
  color: white;
  border: none;

  &:hover {
    background-color: #2e00b8;
  }
`;

// 모달 프롭스 정의
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  content,
  cancelText = '취소',
  confirmText = '확인',
  onCancel,
  onConfirm,
}) => {
  // 외부 클릭 핸들러 (모달 외부 클릭 시 닫기)
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 취소 버튼 핸들러
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  // 확인 버튼 핸들러
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalContent>{content}</ModalContent>
        <ButtonContainer>
          <CancelButton onClick={handleCancel}>{cancelText}</CancelButton>
          <ConfirmButton onClick={handleConfirm}>{confirmText}</ConfirmButton>
        </ButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default Modal;
