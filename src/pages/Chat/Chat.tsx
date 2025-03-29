import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/layout/Header';
import TradeConfirmModal, { TradeData } from './TradeConfirmModal';
import ChatService, { ChatMessageResponseDto, MessageType } from '../../services/ChatService';
import { API_BACKEND_URL } from '../../constants/api';
import axios from 'axios';
import moment from 'moment-timezone';

// moment 타임존 설정
moment.tz.setDefault('Asia/Seoul');

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

// 닉네임 표시
const MessageNickname = styled.div`
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 3px;
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

// 업로드 상태 표시
const UploadStatus = styled.div<{ visible: boolean }>`
  display: ${props => (props.visible ? 'block' : 'none')};
  margin-top: 10px;
  padding: 10px;
  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  position: fixed;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 101;
`;

// 연결 상태 표시
const ConnectionStatus = styled.div<{ connected: boolean }>`
  position: fixed;
  top: 47px;
  left: 0;
  right: 0;
  background-color: ${props => (props.connected ? 'green' : 'red')};
  color: white;
  text-align: center;
  padding: 2px 0;
  font-size: 12px;
  z-index: 10;
  opacity: 0.7;
`;

// 에러 메시지
const ErrorMessage = styled.div`
  background-color: rgba(255, 0, 0, 0.1);
  color: red;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  margin: 10px 0;
`;

// 재시도 버튼
const RetryButton = styled.button`
  background-color: ${THEME.primary};
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  margin-top: 10px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #4a48d0;
  }
`;

interface ChatProps {
  onBack?: () => void;
}

const Chat: React.FC<ChatProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { id: roomIdParam } = useParams<{ id: string }>();
  const roomId = roomIdParam ? parseInt(roomIdParam) : null;

  // 채팅 서비스 인스턴스
  const chatService = ChatService.getInstance();

  // 사용자 ID 상태 - localStorage에서 가져오거나 설정
  const [currentUserId, setCurrentUserId] = useState<number>(() => {
    // localStorage에서 userId 확인
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      return parseInt(savedUserId);
    }

    // 없으면 기본값 1 설정 및 저장
    localStorage.setItem('userId', '1');
    return 1;
  });

  // 메시지 상태 관리
  const [messages, setMessages] = useState<ChatMessageResponseDto[]>([]);

  // 현재 입력 메시지
  const [inputMessage, setInputMessage] = useState('');

  // 모달 상태 관리
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // 이미지 업로드 상태
  const [isUploading, setIsUploading] = useState(false);

  // 연결 상태
  const [isConnected, setIsConnected] = useState(false);

  // 에러 상태
  const [error, setError] = useState<string | null>(null);

  // 채팅 컨테이너 참조
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 이미지 입력 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API 요청 헤더에 userId 추가
  useEffect(() => {
    // localStorage에서 userId 가져오기
    const userId = localStorage.getItem('userId') || '1';

    // axios 인터셉터 설정
    const interceptor = axios.interceptors.request.use(
      config => {
        config.headers['userId'] = userId;
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );

    // 컴포넌트 언마운트 시 인터셉터 제거
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // 뒤로가기 처리 함수
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // 채팅룸 목록으로 이동 (기본값)
      navigate('/chat/list');
    }
  };

  // 방 제목
  const [roomTitle, setRoomTitle] = useState('채팅방');

  // 채팅방 컴포넌트에서 연결 상태 관리 개선
  useEffect(() => {
    if (!roomId) {
      console.error('roomId가 필요합니다');
      handleBack();
      return;
    }

    setError(null);
    setRoomTitle(`채팅방 ${roomId}`);

    let mounted = true;

    // WebSocket 연결 함수
    const connectAndSubscribe = async () => {
      try {
        console.log('채팅 서버에 연결 시도 중...');
        await chatService.connect();

        if (!mounted) return;

        setIsConnected(true);
        setError(null);
        console.log('채팅 서버 연결됨');

        // 메시지 읽음 상태 업데이트
        try {
          await chatService.markMessagesAsRead(roomId, currentUserId);
          console.log('메시지 읽음 처리 완료');
        } catch (error) {
          console.error('메시지 읽음 처리 실패:', error);
        }

        // 메시지 구독
        console.log('채팅방 구독 시도 중...');
        await chatService.subscribeToChatRoom(roomId, message => {
          if (!mounted) return;

          console.log('새 메시지 수신:', message);
          setMessages(prev => {
            // 중복 메시지 방지
            const messageId = message.messageId || message.messageId;
            const isDuplicate = prev.some(
              m =>
                (m.messageId && m.messageId === messageId) ||
                (m.messageId && m.messageId === messageId),
            );

            if (isDuplicate) {
              console.log('중복 메시지 무시');
              return prev;
            }

            return [...prev, message];
          });
        });

        console.log('채팅방 구독 성공');
      } catch (error) {
        console.error('WebSocket 연결/구독 실패:', error);

        if (!mounted) return;

        setIsConnected(false);
        setError('채팅 서버 연결에 실패했습니다. 아래 버튼을 눌러 재시도해주세요.');
      }
    };

    // 연결 시도
    connectAndSubscribe();

    // 이전 메시지 로드
    loadPreviousMessages();

    // 이벤트 리스너 등록
    const connectListener = () => {
      if (!mounted) return;

      setIsConnected(true);
      setError(null);

      // 연결이 복구되면 자동으로 다시 구독
      chatService
        .subscribeToChatRoom(roomId, message => {
          if (!mounted) return;

          setMessages(prev => {
            const messageId = message.messageId || message.messageId;
            const isDuplicate = prev.some(
              m =>
                (m.messageId && m.messageId === messageId) ||
                (m.messageId && m.messageId === messageId),
            );

            if (isDuplicate) return prev;
            return [...prev, message];
          });
        })
        .catch(error => {
          console.error('자동 재구독 실패:', error);
        });
    };

    const errorListener = (errorMessage: string) => {
      if (!mounted) return;

      setError(`연결 오류: ${errorMessage}`);
      setIsConnected(false);
    };

    chatService.onConnect(connectListener);
    chatService.onError(errorListener);

    // 정리 함수
    return () => {
      mounted = false;

      if (roomId) {
        chatService.unsubscribeFromChatRoom(roomId);
      }

      chatService.removeConnectListener(connectListener);
      chatService.removeErrorListener(errorListener);
    };
  }, [roomId, currentUserId]);

  // 이전 메시지 로드 함수
  const loadPreviousMessages = async () => {
    if (!roomId) return;

    try {
      const previousMessages = await chatService.loadMessages(roomId);

      if (previousMessages.length > 0) {
        console.log('이전 메시지 로드 성공:', previousMessages.length);
        setMessages(previousMessages);
      } else {
        console.log('이전 메시지가 없습니다.');
      }
    } catch (error) {
      console.error('이전 메시지 로드 실패:', error);
      setError('메시지를 불러오는데 실패했습니다. 새로고침 후 다시 시도해주세요.');
    }
  };

  // WebSocket 재연결 처리
  const handleReconnect = async () => {
    if (!roomId) return;

    setError(null);

    try {
      await chatService.connect();
      chatService.subscribeToChatRoom(roomId, message => {
        setMessages(prev => [...prev, message]);
      });
      setIsConnected(true);
    } catch (error) {
      setError('재연결에 실패했습니다. 다시 시도해주세요.');
      setIsConnected(false);
    }
  };

  // 채팅 스크롤을 항상 아래로 유지
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 메시지 전송 핸들러
  const handleSendMessage = async () => {
    if (!roomId || inputMessage.trim() === '') return;

    // 연결이 끊어진 경우 재연결 시도
    if (!isConnected) {
      try {
        await handleReconnect();
      } catch (error) {
        setError('서버에 연결할 수 없습니다. 네트워크를 확인하고 다시 시도해주세요.');
        return;
      }
    }

    try {
      setError(null);

      // WebSocket을 통해 메시지 전송
      await chatService.sendTextMessage(roomId, currentUserId, inputMessage);

      // 입력창 초기화
      setInputMessage('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      setError('메시지 전송에 실패했습니다. 네트워크 연결을 확인해주세요.');
    }
  };

  // 확정하기 버튼 핸들러
  const handleConfirm = () => {
    setIsConfirmModalOpen(true);
  };

  // 거래 정보 확정 핸들러
  const handleTradeConfirm = async (data: TradeData) => {
    if (!roomId) return;

    console.log('거래 정보:', data);

    try {
      setError(null);

      // 백엔드에 거래 정보 전송
      const tradeId = await chatService.confirmTrade(roomId, data);
      console.log('거래 ID:', tradeId);

      // 거래 확정 메시지 내용 생성
      const confirmMessage = `거래가 확정되었습니다.\n물건: ${data.itemName}\n가격: ${data.price}원\n기간: ${data.startDate} ~ ${data.endDate}\n거래 ID: ${tradeId}`;

      // 시스템 메시지로 거래 확정 메시지 전송
      await chatService.sendSystemMessage(roomId, confirmMessage);
    } catch (error) {
      console.error('거래 확정 오류:', error);
      setError('거래 확정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 이미지 추가 버튼 핸들러
  const handleAddImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 이미지 선택 핸들러
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!roomId) return;

    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // 이미지 확장자 및 크기 검사
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB 제한

    if (!validImageTypes.includes(file.type)) {
      setError('JPEG, PNG, GIF, WEBP 형식의 이미지만 업로드 가능합니다.');
      return;
    }

    if (file.size > maxFileSize) {
      setError('이미지 크기는 10MB 이하여야 합니다.');
      return;
    }

    try {
      setError(null);
      setIsUploading(true);

      // 이미지 업로드 API 호출
      const imageUrl = await chatService.uploadImage(file);

      // 이미지 메시지 전송
      await chatService.sendImageMessage(roomId, currentUserId, imageUrl);

      console.log('이미지 메시지 전송 완료:', imageUrl);
    } catch (error) {
      console.error('이미지 업로드/전송 실패:', error);
      setError('이미지 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 엔터 키 처리
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // 시간 포맷팅 함수
  const formatMessageTime = (timestamp?: string): string => {
    if (!timestamp) return '';

    // 한국 시간대로 변환하여 시간 포맷팅
    const koreanTime = moment.tz(timestamp, 'Asia/Seoul');

    if (!koreanTime.isValid()) return '';

    const hours = koreanTime.hours();
    const minutes = koreanTime.format('mm');
    const period = hours >= 12 ? '오후' : '오전';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

    return `${period} ${displayHours}:${minutes}`;
  };

  // 날짜 포맷팅 함수
  const formatDateHeader = (timestamp: string): string => {
    // 한국 시간대로 변환하여 날짜 포맷팅
    const koreanDate = moment.tz(timestamp, 'Asia/Seoul');

    if (!koreanDate.isValid()) return '';

    // YYYY.MM.DD 형식으로 포맷팅
    return koreanDate.format('YYYY.MM.DD');
  };

  // 메시지 그룹화 처리
  const groupMessagesByDate = (messages: ChatMessageResponseDto[]) => {
    const result: (ChatMessageResponseDto | { isDateHeader: true; date: string })[] = [];
    let currentDate = '';

    messages.forEach(message => {
      if (!message.createdAt) return;

      const messageDate = formatDateHeader(message.createdAt);

      // 새로운 날짜인 경우 날짜 헤더 추가
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        result.push({ isDateHeader: true, date: messageDate });
      }

      result.push(message);
    });

    return result;
  };

  // 그룹화된 메시지
  const groupedMessages = groupMessagesByDate(messages);

  // 메시지가 현재 사용자가 보낸 것인지 확인
  const isSentByCurrentUser = (message: ChatMessageResponseDto): boolean => {
    return message.senderId === currentUserId;
  };

  return (
    <Container>
      {/* 상단 헤더 */}
      <Header title={roomTitle} showBackButton={true} onBack={handleBack} />

      {/* 연결 상태 표시 */}
      <ConnectionStatus connected={isConnected}>
        {isConnected ? '연결됨' : '연결 끊김'}
      </ConnectionStatus>

      {/* 확정하기 버튼 */}
      <ConfirmButton onClick={handleConfirm}>
        <ConfirmButtonText>확정하기</ConfirmButtonText>
      </ConfirmButton>

      {/* 채팅 영역 */}
      <ChatContainer ref={chatContainerRef}>
        {error && (
          <ErrorMessage>
            {error}
            {!isConnected && (
              <div>
                <RetryButton onClick={handleReconnect}>다시 연결</RetryButton>
              </div>
            )}
          </ErrorMessage>
        )}

        {groupedMessages.map((item, index) => {
          // 날짜 헤더 처리
          if ('isDateHeader' in item) {
            return (
              <DateDivider key={`date-${index}`}>
                <DateText>{item.date}</DateText>
              </DateDivider>
            );
          }

          const message = item as ChatMessageResponseDto;

          // 시스템 메시지 처리
          if (message.messageType === MessageType.SYSTEM) {
            return (
              <SentMessageGroup key={message.messageId || index}>
                <SystemMessageBubble>
                  <MessageContent>{message.content}</MessageContent>
                </SystemMessageBubble>
                {message.createdAt && (
                  <MessageTime>{formatMessageTime(message.createdAt)}</MessageTime>
                )}
              </SentMessageGroup>
            );
          }

          // 현재 사용자가 보낸 메시지
          if (isSentByCurrentUser(message)) {
            return (
              <SentMessageGroup key={message.messageId || index}>
                <SentMessageBubble>
                  {message.messageType === MessageType.IMAGE ? (
                    <ImageMessage
                      src={`${message.content.startsWith('http') ? '' : API_BACKEND_URL}${message.content}`}
                      alt="첨부된 이미지"
                    />
                  ) : (
                    <MessageContent>{message.content}</MessageContent>
                  )}
                </SentMessageBubble>
                {message.createdAt && (
                  <MessageTime>{formatMessageTime(message.createdAt)}</MessageTime>
                )}
              </SentMessageGroup>
            );
          }

          // 다른 사용자가 보낸 메시지
          return (
            <ReceivedMessageGroup key={message.messageId || index}>
              <ReceivedMessageBubble>
                {message.senderNickname && (
                  <MessageNickname>{message.senderNickname}</MessageNickname>
                )}
                {message.messageType === MessageType.IMAGE ? (
                  <ImageMessage
                    src={`${message.content.startsWith('http') ? '' : API_BACKEND_URL}${message.content}`}
                    alt="첨부된 이미지"
                  />
                ) : (
                  <MessageContent>{message.content}</MessageContent>
                )}
              </ReceivedMessageBubble>
              {message.createdAt && (
                <MessageTime>{formatMessageTime(message.createdAt)}</MessageTime>
              )}
            </ReceivedMessageGroup>
          );
        })}
      </ChatContainer>

      {/* 이미지 업로드 상태 */}
      <UploadStatus visible={isUploading}>이미지 업로드 중...</UploadStatus>

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
        chatroomId={roomId || 0}
      />
    </Container>
  );
};

export default Chat;
