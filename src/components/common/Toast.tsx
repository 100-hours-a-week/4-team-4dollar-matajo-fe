import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// 토스트 컨테이너
const ToastContainer = styled(motion.div)`
  position: fixed;
  bottom: 100px; /* 네비게이션 바 위에 표시 */
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  z-index: 1000;
  display: flex;
  align-items: center;
  max-width: 300px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

// 토스트 텍스트
const ToastText = styled.div`
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  text-align: center;
  word-break: break-word;
`;

// 토스트 애니메이션 변수
const toastVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
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
  // 토스트 자동 닫기
  useEffect(() => {
    if (visible && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <ToastContainer
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={toastVariants}
          transition={{ duration: 0.3 }}
        >
          <ToastText>{message}</ToastText>
        </ToastContainer>
      )}
    </AnimatePresence>
  );
};

export default Toast;
