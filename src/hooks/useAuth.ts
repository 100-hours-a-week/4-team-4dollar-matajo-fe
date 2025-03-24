import { useState } from 'react';
import { useAuth as useAuthContext, UserRole } from '../contexts/AuthContext';
import * as authApi from '../api/auth';

export const useAuth = () => {
  const auth = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [keeperStatus, setKeeperStatus] = useState<{
    isKeeper: boolean;
    pendingRegistration: boolean;
  }>({
    isKeeper: false,
    pendingRegistration: false,
  });

  // 일반 회원가입 함수는 제거 (카카오 로그인만 사용)

  // 보관인 등록 요청
  const registerAsKeeper = async (): Promise<boolean> => {
    try {
      setIsRegistering(true);
      setError(null);

      if (!auth.user?.id) {
        setError('로그인이 필요합니다.');
        return false;
      }

      const response = await authApi.registerAsKeeper(auth.user.id);

      if (response.data && response.data.success) {
        // AuthContext의 registerAsKeeper 함수 호출하여 상태 업데이트
        return await auth.registerAsKeeper();
      }

      return false;
    } catch (err) {
      setError('보관인 등록 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsRegistering(false);
    }
  };

  // 보관인 상태 확인
  const checkKeeperStatus = async () => {
    try {
      if (!auth.user?.id) {
        setError('로그인이 필요합니다.');
        return;
      }

      const response = await authApi.checkKeeperStatus(auth.user.id);
      setKeeperStatus(response.data);
    } catch (err) {
      setError('보관인 상태 확인 중 오류가 발생했습니다.');
    }
  };

  // 의뢰인 상태에서 보관인 등록 여부 확인
  const canRegisterAsKeeper = () => {
    return auth.user?.role === UserRole.Client && !keeperStatus.pendingRegistration;
  };

  return {
    ...auth,
    // register 함수 제거
    registerAsKeeper,
    checkKeeperStatus,
    canRegisterAsKeeper,
    isRegistering,
    keeperStatus,
    error,
    setError,
  };
};

export default useAuth;
