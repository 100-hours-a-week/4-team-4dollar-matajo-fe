import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import TradeConfirmModal, { TradeData } from './TradeConfirmModal';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#5B59FD',
  background: '#E6E6FF',
  lightBackground: '#F5F5FF',
  systemMessage: '#FFD773',
  grayText: '#212121',
  lightGrayText: '#666666',
  inputBackground: '#D9D9D9',
  white: '#FFFFFF',
};

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 100%; // 변경: 100%로 설정하여 반응형으로 변경
  max-width: 375px; // 추가: 최대 너비 제한
  height: 100vh;
  position: relative;
  background: ${THEME.background};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin: 0 auto; // 추가: 중앙 정렬
`;

// 채팅 영역 - bottom padding 증가
const ChatContainer = styled.div`
  flex: 1;
  padding: 10px 24px;
  padding-top: 90px; // 헤더 높이 고려
  padding-bottom: 80px; // 입력창 높이 고려 (증가)
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

// 날짜 표시
const DateDivider = styled.div`
  align-self: center;
  background: #d9d9d9;
  border-radius: 8.5px;
  padding: 2px 10px;
  margin: 15px 0;
`;

const DateText = styled.span`
  color: white;
  font-size: 10px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  line-height: 13px;
  letter-spacing: 0.2px;
`;

// 메시지 그룹 (버블 + 시간)
const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 70%;
  margin-bottom: 15px;
`;

// 보낸 메시지 그룹
const SentMessageGroup = styled(MessageGroup)`
  align-self: flex-end;
  align-items: flex-end;
`;

// 받은 메시지 그룹
const ReceivedMessageGroup = styled(MessageGroup)`
  align-self: flex-start;
  align-items: flex-start;
`;

// 메시지 버블 컨테이너 - 기본
const MessageBubbleBase = styled.div`
  padding: 10px 16px;
  border-radius: 10px;
  position: relative;
  width: fit-content;
`;

// 상대방 메시지 버블
const ReceivedMessageBubble = styled(MessageBubbleBase)`
  background: ${THEME.primary};
  color: white;
`;

// 내가 보낸 메시지 버블
const SentMessageBubble = styled(MessageBubbleBase)`
  background: ${THEME.white};
  color: black;
`;

// 시스템 메시지 버블
const SystemMessageBubble = styled(MessageBubbleBase)`
  background: ${THEME.systemMessage};
  color: black;
  align-self: flex-end;

  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: ${THEME.systemMessage};
    right: -10px;
    bottom: 10px;
    transform: rotate(45deg);
    border-radius: 2px;
  }
`;

// 이미지 메시지
const ImageMessage = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 5px;
  margin: 5px 0;
`;

// 메시지 컨텐츠
const MessageContent = styled.div`
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  line-height: 20px;
  word-wrap: break-word;
`;

// 시간 표시
const MessageTime = styled.div`
  font-size: 10px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  color: ${THEME.grayText};
  margin-top: 5px;
`;

// 확정하기 버튼 - 위치 수정
const ConfirmButton = styled.button`
  width: 94px;
  height: 35px;
  position: fixed;
  right: 10px; // 변경: 우측 기준으로 변경
  left: auto; // 변경: left 제거
  top: 60px;
  background: rgba(56, 53, 252, 0.8);
  border-radius: 10px;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;

  @media (max-width: 375px) {
    right: 10px; // 모바일 환경에서 위치 조정
  }
`;

const ConfirmButtonText = styled.span`
  color: white;
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  line-height: 18.84px;
  letter-spacing: 0.32px;
`;

// 메시지 입력 영역 - 수정
const InputContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 375px; // 추가: 최대 너비 제한
  height: 60px;
  background: white;
  padding: 10px;
  display: flex;
  align-items: center;
  z-index: 100;
  margin: 0 auto; // 추가: 중앙 정렬
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1); // 추가: 그림자 효과
`;

const AddButton = styled.button`
  min-width: 40px; // 변경: 최소 너비 설정
  height: 40px;
  border: none;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const AddIcon = styled.div`
  width: 24px;
  height: 24px;
  position: relative;

  &::before,
  &::after {
    content: '';
    position: absolute;
    background: ${THEME.grayText};
  }

  &::before {
    width: 18px;
    height: 2px;
    top: 11px;
    left: 3px;
  }

  &::after {
    width: 2px;
    height: 18px;
    top: 3px;
    left: 11px;
  }
`;

const MessageInput = styled.input`
  flex: 1;
  height: 35px;
  background: ${THEME.inputBackground};
  border: none;
  border-radius: 30px;
  margin: 0 10px;
  padding: 0 15px;
  font-size: 14px;
  font-family: 'Noto Sans KR';

  &:focus {
    outline: none;
  }
`;

const SendButton = styled.button`
  min-width: 40px; // 변경: 최소 너비 설정
  height: 40px;
  border: none;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transform: rotate(9deg);
`;

const SendIcon = styled.div`
  width: 24px;
  height: 24px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    width: 23px;
    height: 23px;
    background-color: ${THEME.grayText};
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z'/%3E%3C/svg%3E");
    mask-size: contain;
    mask-repeat: no-repeat;
  }
`;

// 메시지 타입 정의
interface Message {
  id: number;
  content: string;
  time: string;
  type: 'sent' | 'received' | 'system';
  isImage?: boolean;
  imageUrl?: string;
}

interface ChatProps {
  onBack?: () => void;
}

const Chat: React.FC<ChatProps> = ({ onBack }) => {
  // 뒤로가기 처리 함수
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // 채팅룸 목록으로 이동 (기본값)
      window.location.href = '/chat/list';
    }
  };
  // 메시지 상태 관리
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: '2025.02.27',
      time: '',
      type: 'system', // 날짜 표시는 시스템 메시지로 처리
    },
    {
      id: 2,
      content: '오리 인형 맡기고 싶어요 혹시 가격이 어떻게 될까요?',
      time: '오후 9:15',
      type: 'sent',
    },
    {
      id: 3,
      content: '안돼. 돌아가.',
      time: '오후 9:15',
      type: 'received',
    },
    {
      id: 4,
      content: '거래가 확정 되었습니다.\n거래 내역을 확인해주세요.',
      time: '',
      type: 'system',
    },
  ]);

  // 현재 입력 메시지
  const [inputMessage, setInputMessage] = useState('');

  // 모달 상태 관리
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // 채팅 컨테이너 참조
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 이미지 입력 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 채팅 스크롤을 항상 아래로 유지
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 메시지 전송 핸들러
  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    const newMessage: Message = {
      id: messages.length + 1,
      content: inputMessage,
      time: getCurrentTime(),
      type: 'sent',
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
  };

  // 확정하기 버튼 핸들러
  const handleConfirm = () => {
    setIsConfirmModalOpen(true);
  };

  // 거래 정보 확정 핸들러
  const handleTradeConfirm = (data: TradeData) => {
    console.log('거래 정보:', data);

    // 거래 확정 메시지 추가
    const confirmMessage: Message = {
      id: messages.length + 1,
      content: `거래가 확정 되었습니다.\n거래 내역을 확인해주세요.`,
      time: '',
      type: 'system',
    };

    setMessages([...messages, confirmMessage]);
  };

  // 이미지 추가 버튼 핸들러
  const handleAddImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 이미지 선택 핸들러
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // 파일을 URL로 변환
      const imageUrl = URL.createObjectURL(file);

      console.log('이미지 선택됨:', file.name);

      const newMessage: Message = {
        id: messages.length + 1,
        content: '',
        time: getCurrentTime(),
        type: 'sent',
        isImage: true,
        imageUrl: imageUrl,
      };

      setMessages([...messages, newMessage]);
    }
  };

  // 엔터 키 처리
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // 현재 시간 포맷팅
  const getCurrentTime = (): string => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? '오후' : '오전';
    const displayHours = hours > 12 ? hours - 12 : hours;

    return `${period} ${displayHours}:${minutes}`;
  };

  return (
    <Container>
      {/* 상단 헤더 */}
      <Header title="공간한줄의최대글자는얼마일까요" showBackButton={true} onBack={handleBack} />

      {/* 확정하기 버튼 */}
      <ConfirmButton onClick={handleConfirm}>
        <ConfirmButtonText>확정하기</ConfirmButtonText>
      </ConfirmButton>

      {/* 채팅 영역 */}
      <ChatContainer ref={chatContainerRef}>
        {messages.map(message => {
          if (message.content === '2025.02.27') {
            return (
              <DateDivider key={message.id}>
                <DateText>{message.content}</DateText>
              </DateDivider>
            );
          }

          if (message.type === 'received') {
            return (
              <ReceivedMessageGroup key={message.id}>
                <ReceivedMessageBubble>
                  <MessageContent>{message.content}</MessageContent>
                </ReceivedMessageBubble>
                {message.time && <MessageTime>{message.time}</MessageTime>}
              </ReceivedMessageGroup>
            );
          }

          if (message.type === 'system') {
            return (
              <SentMessageGroup key={message.id}>
                <SystemMessageBubble>
                  <MessageContent>{message.content}</MessageContent>
                </SystemMessageBubble>
              </SentMessageGroup>
            );
          }

          return (
            <SentMessageGroup key={message.id}>
              <SentMessageBubble>
                {message.isImage && message.imageUrl ? (
                  <ImageMessage src={message.imageUrl} alt="첨부된 이미지" />
                ) : (
                  <MessageContent>{message.content}</MessageContent>
                )}
              </SentMessageBubble>
              {message.time && <MessageTime>{message.time}</MessageTime>}
            </SentMessageGroup>
          );
        })}
      </ChatContainer>

      {/* 메시지 입력 영역 */}
      <InputContainer>
        <AddButton onClick={handleAddImage}>
          <AddIcon />
        </AddButton>

        <MessageInput
          type="text"
          placeholder="메시지를 입력하세요..."
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />

        <SendButton onClick={handleSendMessage}>
          <SendIcon />
        </SendButton>

        {/* 숨겨진 파일 입력 */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageSelect}
        />
      </InputContainer>

      {/* 거래 확정 모달 */}
      <TradeConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleTradeConfirm}
      />
    </Container>
  );
};

export default Chat;
