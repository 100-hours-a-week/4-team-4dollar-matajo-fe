import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// 토스트 컨테이너
const ToastContainer = styled(motion.div)`
  position: fixed;
  top: 20px; /* 상단에서 20px 떨어진 위치 */
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  width: fit-content;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 250px;
  max-width: 80%;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

// 토스트 텍스트
const ToastText = styled.div`
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  text-align: center;
  width: 100%;
  word-break: break-word;
`;

// 토스트 애니메이션 변수
const toastVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// 프롭스 타입 정의
interface ToastProps {
  message: string;
  visible: boolean;
  duration?: number;
  onClose?: () => void;
  type?: 'success' | 'error' | 'info';
}

/**
 * 토스트 메시지 컴포넌트
 */
const Toast: React.FC<ToastProps> = ({
  message,
  visible,
  duration = 3000,
  onClose,
  type = 'success',
}) => {
  // 토스트 상태 관리
  const [toastMessage, setMessage] = useState(message);
  const [toastVisible, setVisible] = useState(visible);
  const [toastType, setType] = useState(type);

  // props 변경 감지
  useEffect(() => {
    console.log('Toast props 변경:', { message, visible, type });
    setMessage(message);
    setVisible(visible);
    setType(type);
  }, [message, visible, type]);

  // 토스트 자동 닫기
  useEffect(() => {
    if (toastVisible && onClose) {
      console.log('토스트 타이머 시작');
      const timer = setTimeout(() => {
        console.log('토스트 타이머 종료');
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [toastVisible, duration, onClose]);

  // SHOW_TOAST 이벤트 리스너
  useEffect(() => {
    const handleShowToast = (event: Event) => {
      const customEvent = event as CustomEvent; // Event를 CustomEvent로 캐스팅
      const { message, type } = customEvent.detail;
      setMessage(message);
      setVisible(true);
      setType(type);
    };

    window.addEventListener('SHOW_TOAST', handleShowToast);

    return () => {
      window.removeEventListener('SHOW_TOAST', handleShowToast);
    };
  }, []);

  return (
    <AnimatePresence>
      {toastVisible && (
        <ToastContainer
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={toastVariants}
          transition={{ duration: 0.3 }}
        >
          <ToastText>{toastMessage}</ToastText>
        </ToastContainer>
      )}
    </AnimatePresence>
  );
};

export default Toast;
