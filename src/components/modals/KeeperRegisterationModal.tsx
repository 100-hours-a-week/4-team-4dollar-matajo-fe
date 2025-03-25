// src/components/modals/KeeperRegistrationModal.tsx
import React from 'react';
import Modal from '../../components/common/Modal';

/**
 * 보관인 등록 확인 모달 컴포넌트
 */
interface KeeperRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const KeeperRegistrationModal: React.FC<KeeperRegistrationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  // 모달 내용
  const keeperRegistrationContent = (
    <>
      <span style={{ color: '#5b5a5d', fontSize: '16px', fontWeight: 500 }}>
        보관인 미등록 계정입니다.
        <br />
      </span>
      <span style={{ color: '#010048', fontSize: '16px', fontWeight: 700 }}>보관인 등록</span>
      <span style={{ color: '#5b5a5d', fontSize: '16px', fontWeight: 500 }}>하시겠습니까?</span>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      content={keeperRegistrationContent}
      cancelText="취소"
      confirmText="등록"
      onCancel={onClose}
      onConfirm={onConfirm}
    />
  );
};

export default KeeperRegistrationModal;
