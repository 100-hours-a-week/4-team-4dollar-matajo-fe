// src/components/modals/KeeperRegisterationModal.tsx
import React from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../hooks/auth';
import { checkKeeperRole } from '../../services/api/modules/keeper';

/**
 * 보관인 등록 확인 모달 컴포넌트
 */
interface KeeperRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
}

const KeeperRegistrationModal: React.FC<KeeperRegistrationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}) => {
  // 모달 내용
  const keeperRegistrationContent = (
    <>
      <span style={{ color: '#5b5a5d', fontSize: '16px', fontWeight: 500 }}>
        {message || '보관인 미등록 계정입니다.'}
        <br />
      </span>
      <span style={{ color: '#010048', fontSize: '16px', fontWeight: 700 }}>보관인 등록</span>
      <span style={{ color: '#5b5a5d', fontSize: '16px', fontWeight: 500 }}>하시겠습니까?</span>
    </>
  );

  // 모달 확인 핸들러 - 보관인 역할 확인 후 onConfirm 호출
  const handleConfirm = async () => {
    try {
      // 실제 연동 시에는 API를 통해 보관인 역할 확인
      const isKeeperRole = await checkKeeperRole();

      // 이미 보관인인 경우에 대한 처리
      if (isKeeperRole) {
        // 안내 메시지 표시 또는 다른 처리 가능
        console.log('이미 보관인 역할이 있습니다.');
      }

      // 확인 콜백 실행
      onConfirm();
    } catch (error) {
      console.error('보관인 역할 확인 중 오류:', error);
      onConfirm(); // 에러가 발생해도 일단 진행
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      content={keeperRegistrationContent}
      cancelText="취소"
      confirmText="등록"
      onCancel={onClose}
      onConfirm={handleConfirm}
    />
  );
};

export default KeeperRegistrationModal;
