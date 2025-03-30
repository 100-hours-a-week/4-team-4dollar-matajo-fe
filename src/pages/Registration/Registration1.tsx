import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Modal from '../../components/common/Modal';
import styled from 'styled-components';

// Container 스타일 제거 (MainLayout이 처리)
const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Registration1: React.FC = () => {
  const navigate = useNavigate();
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const handleExitConfirm = () => {
    setIsExitModalOpen(false);
    navigate('/main');
  };

  return (
    <ContentWrapper>
      {/* Header 제거 (MainLayout에서 처리) */}
      {/* 기존 컨텐츠 */}

      <Modal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={handleExitConfirm}
        content={
          <>
            <h3>페이지 나가기</h3>
            <p>작성 중인 내용이 저장되지 않습니다. 정말 나가시겠습니까?</p>
          </>
        }
        confirmText="나가기"
        cancelText="취소"
      />
    </ContentWrapper>
  );
};

export default Registration1;
