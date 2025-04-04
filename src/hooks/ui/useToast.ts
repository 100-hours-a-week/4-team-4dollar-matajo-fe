import { useState, useCallback } from 'react';
import { ToastItem, ToastType } from '../../components/modals/Toast';

// 고유 ID 생성 함수
const generateId = () => Math.random().toString(36).substring(2, 9);

interface UseToastResult {
  toasts: ToastItem[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;

  // 편의 함수
  showSuccessToast: (message: string, duration?: number) => void;
  showErrorToast: (message: string, duration?: number) => void;
  showInfoToast: (message: string, duration?: number) => void;
  showWarningToast: (message: string, duration?: number) => void;
}

const useToast = (): UseToastResult => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // 토스트 추가 함수
  const addToast = useCallback((message: string, type: ToastType, duration?: number) => {
    const id = generateId();
    const newToast: ToastItem = {
      id,
      message,
      type,
      duration,
    };

    setToasts(prevToasts => [...prevToasts, newToast]);
  }, []);

  // 토스트 제거 함수
  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // 편의 함수들
  const showSuccessToast = useCallback(
    (message: string, duration?: number) => {
      addToast(message, ToastType.SUCCESS, duration);
    },
    [addToast],
  );

  const showErrorToast = useCallback(
    (message: string, duration?: number) => {
      addToast(message, ToastType.ERROR, duration);
    },
    [addToast],
  );

  const showInfoToast = useCallback(
    (message: string, duration?: number) => {
      addToast(message, ToastType.INFO, duration);
    },
    [addToast],
  );

  const showWarningToast = useCallback(
    (message: string, duration?: number) => {
      addToast(message, ToastType.WARNING, duration);
    },
    [addToast],
  );

  return {
    toasts,
    addToast,
    removeToast,
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    showWarningToast,
  };
};

export default useToast;
