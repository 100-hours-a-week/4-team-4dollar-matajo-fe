import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

// 토스트 타입 정의
export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

// 토스트 아이템 인터페이스
export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// 애니메이션 정의
const slideIn = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
`;

// 토스트 컨테이너 스타일
const ToastContainer = styled.div`
  position: fixed;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 90%;
  width: 375px;
`;

// 토스트 메시지 스타일 (타입에 따른 색상 적용)
const ToastMessage = styled.div<{ type: ToastType; isExiting: boolean }>`
  margin-bottom: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  min-width: 250px;
  max-width: 100%;
  animation: ${props => (props.isExiting ? slideOut : slideIn)} 0.3s ease-in-out;

  background-color: ${props => {
    switch (props.type) {
      case ToastType.SUCCESS:
        return '#4CAF50';
      case ToastType.ERROR:
        return '#F44336';
      case ToastType.WARNING:
        return '#FF9800';
      case ToastType.INFO:
      default:
        return '#5B59FD';
    }
  }};

  color: white;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
`;

// 토스트 아이콘 컴포넌트
const ToastIcon = styled.div<{ type: ToastType }>`
  margin-right: 12px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    display: inline-block;
    width: 24px;
    height: 24px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;

    background-image: ${props => {
      switch (props.type) {
        case ToastType.SUCCESS:
          return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'/%3E%3C/svg%3E\")";
        case ToastType.ERROR:
          return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z'/%3E%3C/svg%3E\")";
        case ToastType.WARNING:
          return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'/%3E%3C/svg%3E\")";
        case ToastType.INFO:
        default:
          return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'/%3E%3C/svg%3E\")";
      }
    }};
  }
`;

// 토스트 컨텐츠 스타일
const ToastContent = styled.div`
  flex: 1;
`;

// 토스트 메시지 컴포넌트
const Toast: React.FC<{
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}> = ({ toasts, removeToast }) => {
  const [exiting, setExiting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timers: Record<string, NodeJS.Timeout> = {};

    toasts.forEach(toast => {
      // 토스트 자동 제거 타이머 설정 (기본 3초)
      const duration = toast.duration || 3000;

      timers[toast.id] = setTimeout(() => {
        // 애니메이션을 위해 exiting 상태로 변경
        setExiting(prev => ({ ...prev, [toast.id]: true }));

        // 애니메이션 후 제거
        setTimeout(() => {
          removeToast(toast.id);
          setExiting(prev => {
            const newState = { ...prev };
            delete newState[toast.id];
            return newState;
          });
        }, 300); // 애니메이션 시간
      }, duration);
    });

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [toasts, removeToast]);

  return (
    <ToastContainer>
      {toasts.map(toast => (
        <ToastMessage key={toast.id} type={toast.type} isExiting={exiting[toast.id] || false}>
          <ToastIcon type={toast.type} />
          <ToastContent>{toast.message}</ToastContent>
        </ToastMessage>
      ))}
    </ToastContainer>
  );
};

export default Toast;
