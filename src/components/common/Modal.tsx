import React, { ReactNode } from 'react';
import styled from 'styled-components';

// 모달 오버레이 - 화면 전체를 덮는 반투명 배경
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

// 모달 컨테이너
const ModalContainer = styled.div`
  width: 300px;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
`;

// 텍스트 스타일 컴포넌트들
const PrimaryText = styled.span`
  color: #fcfcfe;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  line-height: 14.09px;
  word-wrap: break-word;
`;

const DarkBlueText = styled.span`
  color: #010048;
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  line-height: 19.21px;
  word-wrap: break-word;
`;

const GrayText = styled.span`
  color: #5b5a5d;
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  line-height: 19.21px;
  word-wrap: break-word;
`;

const SecondaryGrayText = styled.span`
  color: #5b5a5d;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  line-height: 14.09px;
  word-wrap: break-word;
`;

// 버튼 컨테이너
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
`;

// 라이트 버튼 (취소)
const LightButton = styled.button`
  width: 130px;
  height: 32px;
  padding: 7.69px 10.25px;
  background: #d7d7ff;
  overflow: hidden;
  border-radius: 4px;
  border: none;
  justify-content: center;
  align-items: center;
  gap: 6.4px;
  display: flex;
  cursor: pointer;

  &:hover {
    background: #c7c7ff;
  }
`;

// 다크 버튼 (등록)
const DarkButton = styled.button`
  width: 130px;
  height: 32px;
  padding: 7.69px 10.25px;
  background: #010048;
  overflow: hidden;
  border-radius: 4px;
  border: none;
  justify-content: center;
  align-items: center;
  gap: 6.4px;
  display: flex;
  cursor: pointer;

  &:hover {
    background: #01002e;
  }
`;

// 모달 제목 컨테이너
const ModalTitle = styled.div`
  margin-bottom: 16px;
  text-align: center;
`;

// 모달 내용 컨테이너
const ModalContent = styled.div`
  margin-bottom: 24px;
  text-align: center;
`;

// 모달 프롭스 정의
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  content: ReactNode;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
}

/**
 * 재사용 가능한 모달 컴포넌트
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  cancelText = '취소',
  confirmText = '확인',
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  // 배경 클릭 시 모달 닫기
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 취소 버튼 클릭 핸들러
  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  // 확인 버튼 클릭 핸들러
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer>
        {title && <ModalTitle>{title}</ModalTitle>}
        <ModalContent>{content}</ModalContent>
        <ButtonContainer>
          <LightButton onClick={handleCancel}>
            <SecondaryGrayText>{cancelText}</SecondaryGrayText>
          </LightButton>
          <DarkButton onClick={handleConfirm}>
            <PrimaryText>{confirmText}</PrimaryText>
          </DarkButton>
        </ButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default Modal;
