import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const StyledSpan = styled.span`
  color: white;
  font-size: 14px;
  font-family: Noto Sans KR;
  font-weight: 700;
  line-height: 18.84px;
  letter-spacing: 0.28px;
  word-wrap: break-word;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const ToastContainer = styled.div<{ visible: boolean }>`
  width: 238px;
  height: 40px;
  position: fixed;
  background: rgba(56.26, 53.49, 252.61, 0.8);
  overflow: hidden;
  border-radius: 15px;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  opacity: ${props => (props.visible ? '1' : '0')};
  visibility: ${props => (props.visible ? 'visible' : 'hidden')};
  transition:
    opacity 0.3s,
    visibility 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface ToastProps {
  message: string;
  duration?: number;
  visible: boolean;
  onClose?: () => void;
}

/**
 * 토스트 메시지 컴포넌트
 * @param message 표시할 메시지
 * @param duration 표시 시간(ms), 기본값 3000ms
 * @param visible 토스트 표시 여부
 * @param onClose 토스트가 닫힐 때 호출될 콜백 함수
 */
const Toast: React.FC<ToastProps> = ({ message, duration = 3000, visible, onClose }) => {
  useEffect(() => {
    if (visible && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [visible, duration, onClose]);

  return (
    <ToastContainer visible={visible}>
      <StyledSpan>{message}</StyledSpan>
    </ToastContainer>
  );
};

/**
 * 토스트 메시지 훅
 * @param duration 토스트 표시 시간(ms), 기본값 3000ms
 * @returns 토스트 컴포넌트와 토스트를 표시하는 함수
 */
export const useToast = (duration = 3000) => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const showToast = (msg: string) => {
    setMessage(msg);
    setVisible(true);
  };

  const hideToast = () => {
    setVisible(false);
  };

  const ToastComponent = () => (
    <Toast message={message} visible={visible} duration={duration} onClose={hideToast} />
  );

  return { showToast, hideToast, ToastComponent };
};

export default Toast;
