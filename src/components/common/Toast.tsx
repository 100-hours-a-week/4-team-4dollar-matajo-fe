// import React, { useEffect, useState } from 'react';
// import styled from 'styled-components';

// const StyledSpan = styled.span`
//   color: white;
//   font-size: 14px;
//   font-family: Noto Sans KR;
//   font-weight: 700;
//   line-height: 18.84px;
//   letter-spacing: 0.28px;
//   word-wrap: break-word;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   height: 100%;
// `;

// const ToastContainer = styled.div<{ visible: boolean }>`
//   width: 238px;
//   height: 40px;
//   position: fixed;
//   background: rgba(56.26, 53.49, 252.61, 0.8);
//   overflow: hidden;
//   border-radius: 15px;
//   bottom: 70px;
//   left: 50%;
//   transform: translateX(-50%);
//   z-index: 1000;
//   opacity: ${props => (props.visible ? '1' : '0')};
//   visibility: ${props => (props.visible ? 'visible' : 'hidden')};
//   transition:
//     opacity 0.3s,
//     visibility 0.3s;
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// interface ToastProps {
//   message: string;
//   duration?: number;
//   visible: boolean;
//   onClose?: () => void;
// }

// /**
//  * 토스트 메시지 컴포넌트
//  * @param message 표시할 메시지
//  * @param duration 표시 시간(ms), 기본값 3000ms
//  * @param visible 토스트 표시 여부
//  * @param onClose 토스트가 닫힐 때 호출될 콜백 함수
//  */
// const Toast: React.FC<ToastProps> = ({ message, duration = 3000, visible, onClose }) => {
//   useEffect(() => {
//     if (visible && onClose) {
//       const timer = setTimeout(() => {
//         onClose();
//       }, duration);

//       return () => {
//         clearTimeout(timer);
//       };
//     }
//   }, [visible, duration, onClose]);

//   return (
//     <ToastContainer visible={visible}>
//       <StyledSpan>{message}</StyledSpan>
//     </ToastContainer>
//   );
// };

// /**
//  * 토스트 메시지 훅
//  * @param duration 토스트 표시 시간(ms), 기본값 3000ms
//  * @returns 토스트 컴포넌트와 토스트를 표시하는 함수
//  */
// export const useToast = (duration = 3000) => {
//   const [message, setMessage] = useState('');
//   const [visible, setVisible] = useState(false);

//   const showToast = (msg: string) => {
//     setMessage(msg);
//     setVisible(true);
//   };

//   const hideToast = () => {
//     setVisible(false);
//   };

//   const ToastComponent = () => (
//     <Toast message={message} visible={visible} duration={duration} onClose={hideToast} />
//   );

//   return { showToast, hideToast, ToastComponent };
// };

// export default Toast;
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// 토스트 컨테이너
const ToastContainer = styled(motion.div)`
  position: fixed;
  bottom: 100px; /* 네비게이션 바 위에 표시 (수정) */
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
}

/**
 * 토스트 메시지 컴포넌트
 */
const Toast: React.FC<ToastProps> = ({ message, visible, duration = 3000, onClose }) => {
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
