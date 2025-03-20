import React, { useState, useEffect, useRef, useCallback } from 'react';
import WebSocketService from '../../services/websocketService';
import chatApiService from '../../api/chat';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import TradeConfirmModal, { TradeData } from './TradeConfirmModal';
import { useNavigate, useParams } from 'react-router-dom';
import * as storageUtils from '../../utils/storage';

// 테마 색상 상수
const THEME = {
  primary: '#5B59FD',
  background: '#E6E6FF',
  lightBackground: '#F5F5FF',
  systemMessage: '#FFD773',
  grayText: '#212121',
  inputBackground: '#D9D9D9',
  white: '#FFFFFF',
};

// 메시지 타입 정의
interface Message {
  id: number;
  content: string;
  time: string;
  type: 'sent' | 'received' | 'system';
  isImage?: boolean;
  imageUrl?: string;
  senderId?: number;
}

// 스타일드 컴포넌트들
const Container = styled.div`
  width: 100%;
  max-width: 375px;
  height: 100vh;
  position: relative;
  background: ${THEME.background};
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  overflow: hidden;
`;

const ChatContainer = styled.div`
  flex: 1;
  padding: 90px 24px 80px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 70%;
  margin-bottom: 15px;
`;

const SentMessageGroup = styled(MessageGroup)`
  align-self: flex-end;
  align-items: flex-end;
`;

const ReceivedMessageGroup = styled(MessageGroup)`
  align-self: flex-start;
  align-items: flex-start;
`;

const MessageBubbleBase = styled.div`
  padding: 10px 16px;
  border-radius: 10px;
  width: fit-content;
  max-width: 250px;
  word-break: break-word;
`;

const ReceivedMessageBubble = styled(MessageBubbleBase)`
  background: ${THEME.primary};
  color: white;
`;

const SentMessageBubble = styled(MessageBubbleBase)`
  background: ${THEME.white};
  color: black;
`;

const SystemMessageBubble = styled(MessageBubbleBase)`
  background: ${THEME.systemMessage};
  color: black;
  align-self: flex-end;
`;

const InputContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 375px;
  height: 60px;
  background: white;
  padding: 10px;
  display: flex;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  z-index: 10;
`;

const MessageInput = styled.input`
  flex: 1;
  height: 35px;
  background: ${THEME.inputBackground};
  border: none;
  border-radius: 30px;
  padding: 0 15px;
  font-size: 14px;
`;

const ImageMessage = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 10px;
`;

const MessageTime = styled.div`
  font-size: 10px;
  color: ${THEME.grayText};
  margin-top: 5px;
`;

// 디버그 컴포넌트
const DebugPanel = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 10px;
  margin: 10px;
  font-size: 12px;
  position: absolute;
  top: 60px;
  right: 10px;
  z-index: 100;
  max-width: 300px;
  max-height: 200px;
  overflow: auto;
  border-radius: 4px;
  display: ${process.env.NODE_ENV === 'production' ? 'none' : 'block'};
`;

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId?: string }>();
  const parsedRoomId = roomId ? parseInt(roomId, 10) : 1;

  // 사용자 ID 상태 관리 - 임시 ID 사용
  const [currentUserId, setCurrentUserId] = useState<number>(() => {
    // 임시 로그인 ID 설정 (테스트용)
    const tempId = 1;
    localStorage.setItem('user_id', tempId.toString());
    return tempId;
  });

  // 메시지 상태 관리
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showDebug, setShowDebug] = useState<boolean>(false);

  // 채팅방 정보 상태
  const [chatroomInfo, setChatroomInfo] = useState<any>(null);

  // 참조
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 채팅방 정보 로드 함수
  const loadChatroomInfo = useCallback(async () => {
    try {
      console.log(`채팅방 ${parsedRoomId} 정보 로드 시작`);
      const roomInfo = await chatApiService.getChatroomDetail(parsedRoomId);
      console.log('채팅방 정보:', roomInfo);
      if (roomInfo) {
        setChatroomInfo(roomInfo);
      }
    } catch (error) {
      console.error('채팅방 정보 로드 실패:', error);
    }
  }, [parsedRoomId]);

  // 컴포넌트 마운트 시 채팅방 정보 로드
  useEffect(() => {
    loadChatroomInfo();
  }, [loadChatroomInfo]);

  // 메시지 로드 함수
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log(`채팅방 ${parsedRoomId}의 메시지 로드 시작`);

      const previousMessages = await chatApiService.getChatroomMessages(parsedRoomId);
      console.log('받은 메시지 데이터:', previousMessages);

      if (previousMessages && previousMessages.length > 0) {
        // 메시지 읽음 처리
        await chatApiService.markMessagesAsRead(parsedRoomId);

        const formattedMessages: Message[] = previousMessages.map(msg => ({
          id: msg.id || Date.now() + Math.random(),
          content: msg.content || '',
          time: formatTime(msg.createdAt || msg.created_at || new Date().toISOString()),
          type:
            msg.senderId === currentUserId || msg.sender_id === currentUserId ? 'sent' : 'received',
          isImage: msg.messageType === 'IMAGE' || msg.message_type === 'IMAGE',
          imageUrl:
            msg.messageType === 'IMAGE' || msg.message_type === 'IMAGE' ? msg.content : undefined,
          senderId: msg.senderId || msg.sender_id,
        }));

        console.log('변환된 메시지:', formattedMessages);
        setMessages(formattedMessages);
      } else {
        console.log('메시지가 없습니다');
        setMessages([]);
      }
    } catch (error) {
      console.error('메시지 로드 실패:', error);
      // 오류 시 빈 배열로 설정
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [parsedRoomId, currentUserId]);

  // 시간 포맷 함수
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // WebSocket 및 초기 메시지 로드 효과
  useEffect(() => {
    // // 로그인 확인 - 임시로 주석 처리
    // if (currentUserId === 0) {
    //   alert('로그인이 필요합니다.');
    //   navigate('/login');
    //   return;
    // }

    // 임시 사용자 ID 설정 (로그인 없이 테스트 용도)
    if (currentUserId === 0) {
      const tempUserId = 1; // 임시 사용자 ID
      localStorage.setItem('user_id', tempUserId.toString());
      setCurrentUserId(tempUserId);
      console.log('임시 사용자 ID 설정:', tempUserId);
    }

    // WebSocket 연결
    WebSocketService.connect(currentUserId.toString(), () => {
      WebSocketService.subscribe(parsedRoomId.toString(), message => {
        console.log('새 메시지 수신:', message);
        const newMessage: Message = {
          id: message.id || Date.now(), // Fallback to timestamp if no ID
          content: message.content,
          time: formatTime(message.createdAt || message.created_at || new Date().toISOString()),
          type:
            message.senderId === currentUserId || message.sender_id === currentUserId
              ? 'sent'
              : 'received',
          isImage: message.messageType === 'IMAGE' || message.message_type === 'IMAGE',
          imageUrl:
            message.messageType === 'IMAGE' || message.message_type === 'IMAGE'
              ? message.content
              : undefined,
          senderId: message.senderId || message.sender_id,
        };

        setMessages(prevMessages => [...prevMessages, newMessage]);

        // 상대방 메시지인 경우 읽음 처리
        if (message.senderId !== currentUserId && message.sender_id !== currentUserId) {
          chatApiService.markMessagesAsRead(parsedRoomId);
        }
      });
    });

    // 이전 메시지 로드
    loadMessages();

    // 컴포넌트 언마운트 시 WebSocket 연결 해제
    return () => {
      WebSocketService.disconnect();
    };
  }, [parsedRoomId, currentUserId, navigate, loadMessages]);

  // 채팅 스크롤 유지
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 메시지 전송 핸들러
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      // 메시지 UI에 먼저 추가 (낙관적 업데이트)
      const tempMessage: Message = {
        id: Date.now(),
        content: inputMessage,
        time: formatTime(new Date().toISOString()),
        type: 'sent',
        senderId: currentUserId,
      };

      setMessages(prevMessages => [...prevMessages, tempMessage]);

      // 입력창 초기화 (사용자 경험 향상)
      const messageToSend = inputMessage;
      setInputMessage('');

      // API로 전송 시도
      const sentMessage = await chatApiService.sendMessage(parsedRoomId, messageToSend);

      // 웹소켓으로 전송 (isConnected 메서드가 없다면 조건 없이 항상 시도)
      WebSocketService.sendMessage(parsedRoomId.toString(), {
        senderId: currentUserId,
        content: messageToSend,
        messageType: 'TEXT',
      });
    } catch (error) {
      console.error('메시지 전송 중 오류 발생:', error);
      // 오류 시에도 사용자에게 알림은 하지만, 이미 UI에 메시지는 표시된 상태임
    }
  };

  // 이미지 메시지 핸들러
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // 이미지 업로드
      const imageUrl = await chatApiService.uploadImage(file);

      // 이미지 메시지 전송
      const sentMessage = await chatApiService.sendImageMessage(parsedRoomId, imageUrl);

      if (sentMessage) {
        // 웹소켓으로 전송
        WebSocketService.sendMessage(parsedRoomId.toString(), {
          senderId: currentUserId,
          content: imageUrl,
          messageType: 'IMAGE',
        });
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      // 에러 처리는 uploadImage 내부에서 이미 수행됨
    }
  };

  // 거래 확정 핸들러
  const handleTradeConfirm = (data: TradeData) => {
    const confirmMessage: Message = {
      id: Date.now(),
      content: `거래가 확정되었습니다.\n거래 내역을 확인해주세요.`,
      time: formatTime(new Date().toISOString()),
      type: 'system',
    };

    setMessages(prevMessages => [...prevMessages, confirmMessage]);
    setIsConfirmModalOpen(false);
  };

  // 디버그 패널 토글
  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  return (
    <Container>
      <Header
        title={chatroomInfo ? chatroomInfo.post_title || '채팅방' : '채팅방'}
        showBackButton
        onBack={() => navigate('/chat/list')}
      />

      {/* 디버그 패널 (개발용) */}
      {showDebug && (
        <DebugPanel>
          <div>
            <strong>룸ID:</strong> {parsedRoomId}
          </div>
          <div>
            <strong>사용자ID:</strong> {currentUserId}
          </div>
          <div>
            <strong>메시지 개수:</strong> {messages.length}
          </div>
          <pre style={{ fontSize: '10px' }}>{JSON.stringify(chatroomInfo, null, 2)}</pre>
        </DebugPanel>
      )}

      {/* 개발 모드에서만 표시되는 디버그 버튼 */}
      {process.env.NODE_ENV !== 'production' && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            backgroundColor: '#eee',
            padding: '5px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px',
          }}
          onClick={toggleDebug}
        >
          디버그
        </div>
      )}

      <ChatContainer ref={chatContainerRef}>
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: THEME.grayText,
            }}
          >
            메시지를 불러오는 중...
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: THEME.grayText,
              textAlign: 'center',
              padding: '0 20px',
            }}
          >
            대화를 시작해보세요!
          </div>
        ) : (
          messages.map(msg => {
            const MessageBubble =
              msg.type === 'received'
                ? ReceivedMessageBubble
                : msg.type === 'system'
                  ? SystemMessageBubble
                  : SentMessageBubble;

            return (
              <div
                key={msg.id}
                style={{
                  alignSelf:
                    msg.type === 'sent'
                      ? 'flex-end'
                      : msg.type === 'system'
                        ? 'center'
                        : 'flex-start',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems:
                    msg.type === 'sent'
                      ? 'flex-end'
                      : msg.type === 'system'
                        ? 'center'
                        : 'flex-start',
                  marginBottom: '10px',
                }}
              >
                <MessageBubble>
                  {msg.isImage && msg.imageUrl ? (
                    <ImageMessage src={msg.imageUrl} alt="첨부 이미지" />
                  ) : (
                    msg.content
                  )}
                </MessageBubble>
                {msg.time && <MessageTime>{msg.time}</MessageTime>}
              </div>
            );
          })
        )}
      </ChatContainer>

      <InputContainer>
        <MessageInput
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
          placeholder="메시지를 입력하세요"
        />
      </InputContainer>

      <TradeConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleTradeConfirm}
      />

      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
    </Container>
  );
};

export default Chat;
