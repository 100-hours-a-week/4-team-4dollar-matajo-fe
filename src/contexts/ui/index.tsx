import React, { createContext, useState, ReactNode } from 'react';
import Toast from '../../components/common/Toast';

// 모달 컨텍스트 인터페이스
interface ModalContextType {
  showToast: (message: string) => void;
  showModal: (content: React.ReactNode, title?: string) => void;
  hideModal: () => void;
}

// 모달 컨텍스트 생성
export const ModalContext = createContext<ModalContextType>({
  showToast: () => {},
  showModal: () => {},
  hideModal: () => {},
});

// 모달 프로바이더 프롭스
interface ModalProviderProps {
  children: ReactNode;
}

/**
 * 모달 및 토스트 상태를 관리하는 컨텍스트 프로바이더
 */
export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  // 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);

  // 토스트 상태
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // 토스트 메시지 표시 함수
  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  // 토스트 메시지 닫기 함수
  const closeToast = () => {
    setToastVisible(false);
  };

  // 모달 표시 함수
  const showModal = (content: React.ReactNode, title?: string) => {
    setModalContent(content);
    setModalTitle(title);
    setModalVisible(true);
  };

  // 모달 닫기 함수
  const hideModal = () => {
    setModalVisible(false);
  };

  return (
    <ModalContext.Provider
      value={{
        showToast,
        showModal,
        hideModal,
      }}
    >
      {children}
      {/* 토스트 컴포넌트 */}
      <Toast message={toastMessage} visible={toastVisible} onClose={closeToast} />
      {/* 모달 컴포넌트는 필요에 따라 추가 */}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
