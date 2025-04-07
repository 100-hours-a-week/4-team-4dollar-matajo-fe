import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/layout/Header';
import TradeConfirmModal, { TradeData } from './TradeConfirmModal';
import ChatService, { ChatMessageResponseDto, MessageType } from '../../services/ChatService';
import { API_BACKEND_URL, API_PATHS } from '../../constants/api';
import axios, { AxiosError } from 'axios';
import moment from 'moment-timezone';
import client from '../../services/api/client';
import { uploadImage } from '../../services/api/modules/image';
import FcmService from '../../services/FcmService';
import Toast from '../../components/common/Toast';

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
  width: 100%;
  max-width: 480px;
  height: calc(100vh - 100px);
  position: relative;
  background: ${THEME.background};
  overflow: auto;
  overflow: auto;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
`;

// 채팅 영역 - 스타일 수정
const ChatContainer = styled.div`
  flex: 1;
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 96px; // 헤더 높이
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 96px; // 헤더 높이
  padding-bottom: 60px; // 입력창 높이
  overflow-y: auto;
  overflow-x: auto;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  -webkit-overflow-scrolling: touch; // iOS 스크롤 부드럽게
  scroll-behavior: smooth; // 스크롤 부드럽게
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

// 메시지 그룹 (버블 + 시간) - 마진 조정
const MessageGroup = styled.div`
  display: flex;
  flex-direction: row;
  max-width: 75%;
  margin-bottom: 8px; // 마진 줄임
  position: relative;
`;
const TimeReadGroup = styled.div`
  bottom: 0;
  min-width: 43px;
  padding-right: 3px;
  padding-left: 3px;
  display: flex;
  flex-direction: column;
  position: relative;
`;

// 보낸 메시지 그룹
const SentMessageGroup = styled(MessageGroup)`
  align-self: flex-end;
  align-items: flex-end;
`;

// 받은 메시지 그룹
const ReceivedMessageGroup = styled(MessageGroup)`
  align-self: flex-start;
  align-items: flex-end;
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
  background: #2f234a;
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
  position: absolute;
  right: 10px; // 변경: 우측 기준으로 변경
  left: auto; // 변경: left 제거
  top: 60px;
  background: #280081;
  border-radius: 10px;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;

  @media (max-width: 480px) {
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
  max-width: 480px;
  height: 60px;
  background: white;
  padding: 10px;
  display: flex;
  align-items: center;
  z-index: 100;
  margin: 0 auto;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  transition: bottom 0.3s ease;
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
  position: relative;
  width: 100%;
  max-width: 480px;
  top: 0;
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

// 읽음 표시 컴포넌트 추가
const ReadStatus = styled.div`
  font-size: 10px;
  color: ${THEME.grayText};
  margin-top: 2px;
  text-align: right;
`;

interface ChatProps {
  onBack?: () => void;
}

const Chat: React.FC<ChatProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { id: tradeId } = useParams();
  const roomId = tradeId ? parseInt(tradeId) : null;

  // 채팅 서비스 인스턴스
  const chatService = ChatService.getInstance();

  // FCM 서비스 인스턴스
  const fcmService = FcmService.getInstance();

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

  // 메시지 상태 관리 - localStorage에서 로드
  const [messages, setMessages] = useState<ChatMessageResponseDto[]>(() => {
    if (!roomId) return [];
    return [];
  });

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
  const [showToast, setShowToast] = useState(false);

  // 채팅 컨테이너 참조
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 이미지 입력 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 채팅방 상세 정보 상태 추가
  const [chatRoomDetail, setChatRoomDetail] = useState<{
    keeper_id: number;
    client_id: number;
  } | null>(null);

  // 메시지 저장을 위한 상태 추가 - localStorage에서 로드
  const [savedMessages, setSavedMessages] = useState<ChatMessageResponseDto[]>(() => {
    if (!roomId) return [];
    return [];
  });

  // 채팅방 재입장 시 마지막 접속 시간 확인
  const [lastAccessTime, setLastAccessTime] = useState<string | null>(null);

  // 키보드 높이 상태 추가
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // 스크롤 상태 관리
  const [isAtBottom, setIsAtBottom] = useState(true);

  // 새 메시지 사운드 객체 생성
  const messageSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 기존 오디오 객체가 있으면 제거
    if (messageSound.current) {
      messageSound.current.pause();
      messageSound.current = null;
    }

    try {
      // 새 오디오 객체 생성
      messageSound.current = new Audio('/notification.mp3');

      // iOS에서 더 안정적인 재생을 위한 설정
      messageSound.current.preload = 'auto';

      // 사용자 상호작용 이벤트에서 오디오 로드
      const loadAudio = () => {
        if (messageSound.current) {
          messageSound.current.load();
        }
        // 한 번만 실행하도록 이벤트 리스너 제거
        document.removeEventListener('click', loadAudio);
      };

      document.addEventListener('click', loadAudio);

      // 컴포넌트 언마운트 시 오디오 정리
      return () => {
        if (messageSound.current) {
          messageSound.current.pause();
          messageSound.current = null;
        }
        document.removeEventListener('click', loadAudio);
      };
    } catch (error) {
      console.error('오디오 초기화 오류:', error);
    }
  }, []); // 빈 의존성 배열

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

  // FCM 설정 초기화
  useEffect(() => {
    // FCM 서비스 가시성 리스너 설정
    fcmService.setupVisibilityListener();

    // FCM 메시지 이벤트 리스너 (컴포넌트 외부에서 발생한 FCM 이벤트 처리)
    const handleFcmMessage = (event: Event) => {
      const customEvent = event as CustomEvent;
      const payload = customEvent.detail;

      if (payload?.notification) {
        const title = payload.notification.title || '';
        const body = payload.notification.body || '';
        const message = title ? `${title}: ${body}` : body;

        if (message) {
          playNotificationSound();
        }
      }
    };

    // DOM에 FCM 이벤트 리스너 등록
    window.addEventListener('fcm-message', handleFcmMessage);

    // 클린업 함수
    return () => {
      window.removeEventListener('fcm-message', handleFcmMessage);
    };
  }, []);

  // 재생 관련 문제를 방지하기 위해 사운드 재생 함수 개선
  const playNotificationSound = () => {
    try {
      // 이미 생성된 오디오 객체 사용
      if (messageSound.current) {
        // iOS에서 사용자 상호작용 없이 오디오 재생을 위해 초기화
        messageSound.current.currentTime = 0;
        messageSound.current.volume = 0.5;

        const playPromise = messageSound.current.play();

        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn('Audio play failed:', error);
            // 자동 재생 정책으로 인한 오류는 무시 (사용자 상호작용 필요)
          });
        }
      }
    } catch (error) {
      console.error('알림 사운드 재생 실패:', error);
    }
  };

  // 채팅방 컴포넌트에서 연결 상태 관리 개선
  useEffect(() => {
    if (!roomId) return;

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

        // 메시지 구독
        console.log('채팅방 구독 시도 중...');
        await chatService.subscribeToChatRoom(roomId, message => {
          if (!mounted) return;

          console.log('새 메시지 수신:', message);

          // 입장 메시지는 화면에 표시하지 않음
          if (
            message.message_type === MessageType.SYSTEM &&
            message.content.includes('사용자가 채팅방에 입장했습니다')
          ) {
            console.log('입장 메시지는 화면에 표시하지 않음');
            return;
          }

          setMessages(prev => {
            // 중복 메시지 방지
            const isDuplicate = prev.some(m => m.message_id === message.message_id);

            if (isDuplicate) {
              console.log('중복 메시지 무시');
              return prev;
            }

            const newMessages = [...prev, message];
            // WebSocket으로 받은 메시지도 savedMessages에 저장
            setSavedMessages(newMessages);

            // 상대방이 보낸 메시지이고 읽지 않은 경우에만 읽음 처리
            if (message.sender_id !== currentUserId && !message.read_status) {
              chatService.markMessagesAsReadViaWebSocket(roomId, currentUserId).catch(e => {
                console.error('읽음 처리 실패:', e);
              });
            }

            return newMessages;
          });
        });

        // 읽음 상태 구독 로직
        const handleReadStatusUpdate = (data: any) => {
          console.log('읽음 상태 업데이트:', data);

          setMessages(prevMessages =>
            prevMessages.map(msg => {
              if (data.messageIds && data.messageIds.includes(msg.message_id)) {
                return { ...msg, read_status: true };
              }
              return msg;
            }),
          );
        };

        const readStatusSubscriptionId = `read-status-${roomId}`;

        try {
          const readStatusSubscription = chatService.subscribeToReadStatus(
            roomId,
            handleReadStatusUpdate,
          );
          chatService.addSubscription(readStatusSubscriptionId, readStatusSubscription);
        } catch (error) {
          console.error('읽음 상태 구독 실패:', error);
        }

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
            const isDuplicate = prev.some(m => m.message_id === message.message_id);

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

      // FCM 메시지 리스너 제거
      fcmService.offMessage(() => {});
    };
  }, [roomId, currentUserId]);

  // 메시지 수신 시 토스트 알림 표시 - 로직 추가
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      // 방금 받은 메시지가 다른 사람이 보낸 것이고, 스크롤이 하단에 있지 않은 경우
      if (
        lastMessage.sender_id !== currentUserId &&
        !isAtBottom &&
        !lastMessage.content.includes('사용자가 채팅방에 입장했습니다')
      ) {
        // 새 메시지 알림 토스트 표시
        const senderName = lastMessage.sender_nickname || '상대방';
        const messagePreview =
          lastMessage.message_type === MessageType.IMAGE
            ? '📷 이미지를 보냈습니다'
            : lastMessage.content.length > 15
              ? `${lastMessage.content.substring(0, 15)}...`
              : lastMessage.content;

        playNotificationSound();
      }
    }
  }, [messages, currentUserId, isAtBottom]);

  // 메시지 로드 함수 수정
  const loadPreviousMessages = async () => {
    if (!roomId) return;

    try {
      console.log('이전 메시지 로드 시작...');

      // 서버에서 메시지 로드
      const serverMessages = await chatService.loadMessages(roomId);
      console.log('서버에서 받은 메시지:', serverMessages.length);

      // 서버 메시지만 사용
      setMessages(serverMessages);
      setSavedMessages(serverMessages);
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

  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      setIsAtBottom(Math.abs(scrollHeight - scrollTop - clientHeight) < 10);
    }
  };

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // 스크롤 관련 useEffect 수정
  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    };

    // 메시지가 변경될 때마다 스크롤 (하단에 있을 때만)
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  // 스크롤을 최하단으로 이동시키는 함수 정의
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // 새 메시지 수신 시 스크롤다운
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      // 하단에 있을때 스크롤 다운운
      if (isAtBottom) {
        scrollToBottom();
      }
    }
  }, [messages, currentUserId]);

  // 메시지 전송 핸들러
  const handleSendMessage = async () => {
    if (!roomId) return;

    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    // 메시지 길이 제한 (500자)
    if (trimmedMessage.length > 500) {
      setError('메시지는 500자를 초과할 수 없습니다.');
      return;
    }

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
      await chatService.sendTextMessage(roomId, currentUserId, trimmedMessage);

      // 입력창 초기화
      setInputMessage('');

      // 메시지 전송 후 강제로 스크롤다운
      if (chatContainerRef.current) {
        scrollToBottom();
      }
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
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB 제한

    if (!validImageTypes.includes(file.type)) {
      setError('JPEG, JPG, PNG, HEIC, WEBP 형식의 이미지만 업로드 가능합니다.');
      return;
    }

    if (file.size > maxFileSize) {
      setError('이미지 크기는 10MB 이하여야 합니다.');
      return;
    }

    try {
      setError(null);
      setIsUploading(true);

      // 이미지 업로드
      const imageUrl = await uploadImage(file, 'chat');

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

    // 입장 메시지를 필터링한 메시지 배열 사용
    const filteredMessages = messages.filter(
      msg =>
        !(
          msg.message_type === MessageType.SYSTEM &&
          msg.content.includes('사용자가 채팅방에 입장했습니다')
        ),
    );

    // 메시지를 시간순으로 정렬 (오래된 메시지가 위로 가도록)
    const sortedMessages = [...filteredMessages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    sortedMessages.forEach(message => {
      if (!message.created_at) return;

      const messageDate = formatDateHeader(message.created_at);

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
    return message.sender_id === currentUserId;
  };

  // 현재 사용자가 보관인인지 확인하는 함수
  const isKeeper = () => {
    if (!chatRoomDetail) return false;
    const currentUserId = Number(localStorage.getItem('userId'));
    return currentUserId === chatRoomDetail.keeper_id;
  };

  // 채팅방 상세 정보 로드
  useEffect(() => {
    const loadChatRoomDetail = async () => {
      if (!roomId) return;

      try {
        const response = await client.get(
          `${API_PATHS.CHAT.DETAIL.replace(':roomId', roomId.toString())}`,
        );
        if (response.data.success) {
          setChatRoomDetail(response.data.data);
          console.log('채팅방 상세 정보:', response.data.data);
        }
      } catch (error) {
        console.error('채팅방 상세 정보 로드 실패:', error);
      }
    };

    loadChatRoomDetail();
  }, [roomId]);

  // 읽음 상태 처리 함수 추가
  const handleReadStatus = async (message: ChatMessageResponseDto) => {
    if (!message.read_status && message.sender_id !== currentUserId && roomId) {
      try {
        await chatService.markMessagesAsReadViaWebSocket(roomId, currentUserId);
        // 메시지 상태 업데이트
        setMessages(prev =>
          prev.map(msg =>
            msg.message_id === message.message_id ? { ...msg, read_status: true } : msg,
          ),
        );
      } catch (error) {
        console.error('읽음 처리 실패:', error);
      }
    }
  };

  // 채팅방 재입장 시 마지막 접속 시간 확인
  useEffect(() => {
    const checkLastAccess = async () => {
      if (!roomId) return;

      try {
        const response = await client.get(
          `${API_PATHS.CHAT.DETAIL.replace(':roomId', roomId.toString())}`,
        );
        if (response.data.success) {
          const lastAccess = response.data.data.last_access_time;
          setLastAccessTime(lastAccess);

          // 채팅방 삭제 여부 확인
          const isDeleted = response.data.data.is_deleted;

          if (isDeleted) {
            // 채팅방이 삭제된 경우, 마지막 접속 시간 이후의 메시지만 로드
            const messages = await chatService.loadMessages(roomId);
            const filteredMessages = messages.filter(
              msg => new Date(msg.created_at) > new Date(lastAccess),
            );
            setMessages(filteredMessages);
            setSavedMessages(filteredMessages);
          } else {
            // 단순 나가기 후 재입장의 경우, 모든 메시지 로드
            await loadPreviousMessages();
          }
        }
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 403) {
          console.log('잘못된 접근입니다!!!');
          navigate('/chat/list');
        }
        console.error('마지막 접속 시간 확인 실패:', error);
      }
    };

    checkLastAccess();
  }, [roomId]);

  // 메시지 렌더링 시 읽음 상태 처리
  useEffect(() => {
    const unreadMessages = messages.filter(
      message => !message.read_status && message.sender_id !== currentUserId,
    );

    if (unreadMessages.length > 0 && roomId) {
      handleReadStatus(unreadMessages[0]);
    }
  }, [messages, currentUserId, roomId]);

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    const handleFocus = () => {
      // 모바일에서 input focus 시 키보드가 올라오는 것을 감지
      setTimeout(() => {
        const currentHeight = window.innerHeight;
        const windowHeight = window.outerHeight;
        const keyboardHeight = windowHeight - currentHeight;
        setKeyboardHeight(keyboardHeight);
      }, 100);
    };

    const handleBlur = () => {
      setKeyboardHeight(0);
    };

    // 초기 높이 설정
    handleResize();

    // 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);
    window.addEventListener('focusin', handleFocus);
    window.addEventListener('focusout', handleBlur);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('focusin', handleFocus);
      window.removeEventListener('focusout', handleBlur);
    };
  }, []);

  // InputContainer 스타일 동적 적용
  //const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isMobile = window.innerWidth < 500;

  const inputContainerStyle = {
    bottom: isMobile ? keyboardHeight : 0,
    transition: isMobile ? 'bottom 0.3s ease' : 'none',
  };

  // 에러 메시지 표시를 위한 useEffect
  useEffect(() => {
    if (error) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        setError(null); // 에러 메시지 초기화
      }, 3000); // 3초 후에 토스트 메시지 사라짐

      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <Container>
      {/* 상단 헤더 */}
      <Header title={roomTitle} showBackButton={true} onBack={handleBack} />

      {/* 연결 상태 표시 */}
      <ConnectionStatus connected={isConnected}>
        {isConnected ? '연결됨' : '연결 끊김'}
      </ConnectionStatus>

      {/* 확정하기 버튼 - 보관인일 때만 표시 */}
      {isKeeper() && (
        <ConfirmButton onClick={handleConfirm}>
          <ConfirmButtonText>확정하기</ConfirmButtonText>
        </ConfirmButton>
      )}

      {/* 채팅 영역 */}
      <ChatContainer
        ref={chatContainerRef}
        style={{
          paddingBottom: isAtBottom ? '60px' : '20px',
        }}
      >
        {/* 에러 메시지 토스트 */}
        <Toast
          message={error || ''}
          visible={showToast}
          type="error"
          onClose={() => setShowToast(false)}
        />

        {groupedMessages.map((item, index) => {
          if ('isDateHeader' in item) {
            return (
              <DateDivider key={`date-${index}`}>
                <DateText>{item.date}</DateText>
              </DateDivider>
            );
          }

          const message = item as ChatMessageResponseDto;

          if (message.message_type === MessageType.SYSTEM) {
            return (
              <SentMessageGroup key={message.message_id || index}>
                <TimeReadGroup>
                  {message.created_at && (
                    <MessageTime>{formatMessageTime(message.created_at)}</MessageTime>
                  )}
                </TimeReadGroup>
                <SystemMessageBubble>
                  <MessageContent>{message.content}</MessageContent>
                </SystemMessageBubble>
              </SentMessageGroup>
            );
          }

          if (isSentByCurrentUser(message)) {
            return (
              <SentMessageGroup key={message.message_id || index}>
                <TimeReadGroup>
                  {message.created_at && (
                    <MessageTime>{formatMessageTime(message.created_at)}</MessageTime>
                  )}
                  {message.read_status && <ReadStatus>읽음</ReadStatus>}
                </TimeReadGroup>
                <SentMessageBubble>
                  {message.message_type === MessageType.IMAGE ? (
                    <ImageMessage src={message.content} alt="첨부된 이미지" />
                  ) : (
                    <MessageContent>{message.content}</MessageContent>
                  )}
                </SentMessageBubble>
              </SentMessageGroup>
            );
          }

          return (
            <ReceivedMessageGroup key={message.message_id || index}>
              <ReceivedMessageBubble>
                {message.sender_nickname && (
                  <MessageNickname>{message.sender_nickname}</MessageNickname>
                )}
                {message.message_type === MessageType.IMAGE ? (
                  <ImageMessage src={message.content} alt="첨부된 이미지" />
                ) : (
                  <MessageContent>{message.content}</MessageContent>
                )}
              </ReceivedMessageBubble>
              <TimeReadGroup>
                {message.created_at && (
                  <MessageTime>{formatMessageTime(message.created_at)}</MessageTime>
                )}
              </TimeReadGroup>
            </ReceivedMessageGroup>
          );
        })}
      </ChatContainer>

      {/* 이미지 업로드 상태 */}
      <UploadStatus visible={isUploading}>이미지 업로드 중...</UploadStatus>

      {/* 메시지 입력 영역 */}
      <InputContainer style={inputContainerStyle}>
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
