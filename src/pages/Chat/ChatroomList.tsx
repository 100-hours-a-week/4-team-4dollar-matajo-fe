import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import Modal from '../../components/common/Modal';
import ChatService, { ChatRoomResponseDto } from '../../services/ChatService';
import axios from 'axios';
import moment from 'moment-timezone';
import { getUserId } from '../../utils/formatting/decodeJWT';

// moment 타임존 설정
moment.tz.setDefault('Asia/Seoul');

// 테마 컬러 상수 정의
const THEME = {
  primary: '#3A00E5',
  primaryLight: '#5E5CFD',
  highlight: '#605EFD',
  grayText: '#6F6F6F',
  lightGrayText: '#9C9C9C',
  borderColor: '#E0E0E0',
  white: '#FFFFFF',
  background: '#F5F5FF',
};

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 100%;
  height: calc(100vh - 166px); /* 네비게이션 바 높이 제외 */
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: auto;
  padding-bottom: 40px;
  padding-top: 10px;
`;

// 위치 정보
const Location = styled.div`
  color: #616161;
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 350;
  letter-spacing: 0.01px;
`;

// 로딩 스피너 스타일
const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  z-index: 5;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(94, 92, 253, 0.3);
  border-radius: 50%;
  border-top-color: ${THEME.primaryLight};
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// 모달 관련 스타일 컴포넌트
const GrayText = styled.span`
  color: #5b5a5d;
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  line-height: 19.21px;
  word-wrap: break-word;
`;

const HighlightText = styled.span`
  color: #010048;
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  line-height: 19.21px;
  word-wrap: break-word;
`;

// 에러 메시지 컨테이너
const ErrorContainer = styled.div`
  text-align: center;
  padding: 20px;
  color: #ff5050;
  font-size: 14px;
`;

// 데이터 없을 때 보여줄 컴포넌트
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const EmptyStateText = styled.p`
  color: ${THEME.grayText};
  font-size: 16px;
  margin-top: 10px;
`;

// 채팅방 아이템 컨테이너
const ChatroomItem = styled.div<{ isPressed?: boolean }>`
  width: 327px;
  position: relative;
  margin: 0 auto;
  padding: 20px 0;
  display: flex;
  border-bottom: 1px solid ${THEME.borderColor};
  cursor: pointer;
  background-color: ${props => (props.isPressed ? 'rgba(94, 92, 253, 0.05)' : 'transparent')};
  transition: background-color 0.2s ease;
`;

// 프로필 이미지
const ProfileImage = styled.div<{ url?: string }>`
  width: 69px;
  height: 66px;
  border-radius: 2px;
  background-color: #f0f0f0;
  background-image: ${props => (props.url ? `url(${props.url})` : 'none')};
  background-size: cover;
  background-position: center;
  margin-right: 15px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// 채팅방 정보 컨테이너
const ChatInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 66px;
`;

// 상단 정보 (닉네임, 시간)
const TopInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// 닉네임
const Nickname = styled.div`
  color: #616161;
  font-size: 18px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.02px;
`;

// 시간
const Time = styled.div`
  color: #616161;
  font-size: 9px;
  font-family: 'Noto Sans KR';
  font-weight: 350;
  letter-spacing: 0.01px;
`;

// 메시지 내용
const MessageContent = styled.div<{ isUnread?: boolean }>`
  color: ${props => (props.isUnread ? THEME.highlight : '#6F6F6F')};
  font-size: 13px;
  font-family: 'Noto Sans KR';
  font-weight: ${props => (props.isUnread ? 500 : 400)};
  letter-spacing: 0.01px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 230px; /* 적절한 너비로 조정 */
`;

// 읽지 않은 메시지 수 표시를 위한 스타일 컴포넌트 추가
const UnreadCount = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #ff4b4b;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
`;

const ChatroomList: React.FC = () => {
  const navigate = useNavigate();

  // 채팅 서비스 인스턴스
  const chatService = ChatService.getInstance();

  // 현재 사용자 ID - accessToken에서 추출
  const [currentUserId, setCurrentUserId] = useState<number>(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
      return 0;
    }

    const userId = getUserId(accessToken);
    if (userId === null) {
      navigate('/login');
      return 0;
    }

    // userId를 localStorage에 저장
    localStorage.setItem('userId', userId.toString());
    return userId;
  });

  // userId가 0인 경우(인증 실패) 처리
  useEffect(() => {
    if (currentUserId === 0) {
      navigate('/login');
    }
  }, [currentUserId, navigate]);

  // 채팅방 데이터 상태
  const [chatrooms, setChatrooms] = useState<ChatRoomResponseDto[]>([]);

  // 로딩 상태
  const [loading, setLoading] = useState(true);

  // 에러 상태
  const [error, setError] = useState<string | null>(null);

  // 모달 상태
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [selectedChatroomId, setSelectedChatroomId] = useState<number | null>(null);
  const [pressedChatroomId, setPressedChatroomId] = useState<number | null>(null);

  // 롱 프레스 관련 상태 및 타이머 참조
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  // 채팅방 나가기 진행 상태
  const [leavingChatroomId, setLeavingChatroomId] = useState<number | null>(null);

  useEffect(() => {
    // API 요청 시 사용할 userId 헤더 설정
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

  // 채팅방 목록 불러오기
  const loadChatrooms = async () => {
    try {
      setLoading(true);
      setError(null);

      const chatRooms = await chatService.loadChatRooms();
      console.log('로드된 채팅방 목록:', chatRooms);
      setChatrooms(chatRooms);
    } catch (err) {
      console.error('채팅방 목록 로드 실패:', err);
      setError('채팅방 목록을 불러오는 데 실패했습니다. 네트워크 연결을 확인해주세요.');
      setChatrooms([]);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 채팅방 목록 로드
  useEffect(() => {
    loadChatrooms();

    // 페이지 벗어날 때 정리
    return () => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);

  // 채팅방 클릭 핸들러
  const handleChatroomClick = (roomId: number) => {
    if (!isLongPress) {
      console.log(`채팅방 ${roomId} 클릭됨`);
      navigate(`/chat/${roomId}`);
    }
    // 롱 프레스 상태 초기화
    setIsLongPress(false);
  };

  // 터치 시작 핸들러
  const handleTouchStart = (roomId: number) => {
    setPressedChatroomId(roomId);
    longPressTimeoutRef.current = setTimeout(() => {
      setIsLongPress(true);
      setSelectedChatroomId(roomId);
      setIsLeaveModalOpen(true);
    }, 700); // 700ms 이상 누르면 롱 프레스로 인식
  };

  // 터치 종료 핸들러
  const handleTouchEnd = () => {
    setPressedChatroomId(null);
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  // 마우스 다운 핸들러 (데스크탑 지원)
  const handleMouseDown = (roomId: number) => {
    setPressedChatroomId(roomId);
    longPressTimeoutRef.current = setTimeout(() => {
      setIsLongPress(true);
      setSelectedChatroomId(roomId);
      setIsLeaveModalOpen(true);
    }, 700);
  };

  // 마우스 업 핸들러 (데스크탑 지원)
  const handleMouseUp = () => {
    setPressedChatroomId(null);
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    loadChatrooms();
  };

  // 채팅방 나가기 확인 핸들러
  const handleLeaveChatroom = async () => {
    if (selectedChatroomId) {
      try {
        // 나가기 진행 중 상태 설정
        setLeavingChatroomId(selectedChatroomId);

        // 모달 닫기 (진행 중 UI는 채팅방 리스트에 표시)
        setIsLeaveModalOpen(false);

        // API 호출로 채팅방 나가기
        const success = await chatService.leaveChatRoom(selectedChatroomId);

        if (success) {
          // 화면에서 해당 채팅방 제거
          setChatrooms(prev => prev.filter(room => room.chatRoomId !== selectedChatroomId));
          console.log(`채팅방 ${selectedChatroomId} 나가기 처리됨`);
        } else {
          setError('채팅방 나가기에 실패했습니다. 다시 시도해주세요.');
        }
      } catch (error) {
        console.error(`채팅방 나가기 실패:`, error);
        setError('채팅방 나가기에 실패했습니다. 다시 시도해주세요.');
      } finally {
        // 나가기 진행 중 상태 초기화
        setLeavingChatroomId(null);
        setSelectedChatroomId(null);
      }
    } else {
      // 모달 닫기
      setIsLeaveModalOpen(false);
    }
  };

  // 모달 취소 핸들러
  const handleCancelLeave = () => {
    setIsLeaveModalOpen(false);
    setSelectedChatroomId(null);
  };

  // 메시지 내용 가공 (14자 이상이면 ... 처리)
  const formatMessage = (message: string) => {
    if (!message) return '';
    if (message.length > 14) {
      return `${message.substring(0, 14)}...`;
    }
    return message;
  };

  // 시간 포맷팅 함수 - moment-timezone 사용하여 개선 (yyyy-MM-ddThh:mm:ss 형식의 ISO 문자열을 처리)
  const formatTime = (isoTime: string): string => {
    if (!isoTime) return '';

    try {
      // 한국 시간대로 변환
      const koreanTime = moment.tz(isoTime, 'Asia/Seoul');

      if (!koreanTime.isValid()) return '';

      const now = moment().tz('Asia/Seoul');
      const yesterday = moment().tz('Asia/Seoul').subtract(1, 'days');

      // 오늘인 경우
      if (koreanTime.isSame(now, 'day')) {
        // 시간만 표시 (오전/오후 HH:MM)
        const hours = koreanTime.hours();
        const period = hours >= 12 ? '오후' : '오전';
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

        return `${period} ${displayHours}:${koreanTime.format('mm')}`;
      }
      // 어제인 경우
      else if (koreanTime.isSame(yesterday, 'day')) {
        return '어제';
      }
      // 올해인 경우
      else if (koreanTime.isSame(now, 'year')) {
        // MM/DD 형식
        return koreanTime.format('MM/DD');
      }
      // 작년 이전인 경우
      else {
        // YYYY/MM/DD 형식
        return koreanTime.format('YYYY/MM/DD');
      }
    } catch (e) {
      console.error('시간 포맷팅 오류:', e);
      return '';
    }
  };

  // 새 채팅방 생성 핸들러
  const handleCreateNewChatRoom = async () => {
    try {
      // 실제 구현에서는 보관소 선택 모달을 띄우거나 postId를 입력받는 로직이 필요합니다.
      // 지금은 테스트용으로 postId를 1로 고정합니다.
      const postId = 1;
      const response = await chatService.createChatRoom({
        post_id: postId,
      });

      if (response.success && response.data) {
        // 생성 후 채팅방으로 이동
        navigate(`/chat/${response.data.id}`);
      }
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      setError('채팅방 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 채팅방 나가기 모달 내용
  const leaveChatroomContent = (
    <>
      <GrayText>해당 </GrayText>
      <HighlightText>채팅방</HighlightText>
      <GrayText>에서 나가시겠습니까?</GrayText>
      <div style={{ fontSize: '13px', color: '#909090', marginTop: '10px' }}>
        채팅방을 나가면 대화 내용이 모두 삭제되며,
        <br />
        상대방의 초대 없이는 재입장할 수 없습니다.
      </div>
    </>
  );

  return (
    <>
      {/* 상단 헤더 */}
      <Header title="채팅 리스트" showBackButton={true} onBack={() => navigate('/')} />

      <Container>
        {/* 에러 메시지 표시 */}
        {error && (
          <ErrorContainer>
            {error}
            <button onClick={handleRefresh} style={{ marginLeft: '10px', color: THEME.primary }}>
              새로고침
            </button>
          </ErrorContainer>
        )}

        {/* 로딩 상태 표시 */}
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <LoadingSpinner />{' '}
            <span style={{ marginLeft: '10px' }}>채팅방 목록을 불러오는 중...</span>
          </div>
        ) : chatrooms.length === 0 ? (
          <EmptyState>
            <EmptyStateText>참여 중인 채팅방이 없습니다.</EmptyStateText>
            <button
              onClick={handleCreateNewChatRoom}
              style={{
                marginTop: '20px',
                padding: '8px 15px',
                backgroundColor: THEME.primary,
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              새 채팅방 만들기
            </button>
          </EmptyState>
        ) : (
          /* 채팅방 목록 */
          chatrooms.map(chatroom => (
            <ChatroomItem
              key={chatroom.chatRoomId}
              isPressed={pressedChatroomId === chatroom.chatRoomId}
              onClick={() => handleChatroomClick(chatroom.chatRoomId)}
              onTouchStart={() => handleTouchStart(chatroom.chatRoomId)}
              onTouchEnd={handleTouchEnd}
              onMouseDown={() => handleMouseDown(chatroom.chatRoomId)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                opacity: leavingChatroomId === chatroom.chatRoomId ? 0.6 : 1,
                position: 'relative',
              }}
            >
              <ProfileImage url={chatroom.postMainImage}>
                {!chatroom.postMainImage && (
                  <span style={{ textAlign: 'center', fontSize: '12px', color: '#999' }}>
                    프로필
                    <br />
                    이미지
                  </span>
                )}
              </ProfileImage>

              <ChatInfo>
                <TopInfo>
                  <Nickname>{chatroom.userNickname || '알 수 없음'}</Nickname>
                  <Time>{formatTime(chatroom.lastMessageTime)}</Time>
                </TopInfo>

                <MessageContent isUnread={chatroom.unreadCount > 0}>
                  {formatMessage(chatroom.lastMessage || '(메시지 없음)')}
                </MessageContent>

                <Location>{chatroom.postAddress || ''}</Location>

                {chatroom.unreadCount > 0 && <UnreadCount>{chatroom.unreadCount}</UnreadCount>}
              </ChatInfo>

              {/* 나가기 진행 중 상태 표시 */}
              {leavingChatroomId === chatroom.chatRoomId && (
                <LoadingOverlay>
                  <LoadingSpinner />
                </LoadingOverlay>
              )}
            </ChatroomItem>
          ))
        )}
      </Container>

      {/* 채팅방 나가기 모달 */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={handleCancelLeave}
        content={leaveChatroomContent}
        cancelText="취소"
        confirmText="삭제"
        onCancel={handleCancelLeave}
        onConfirm={handleLeaveChatroom}
      />

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="채팅" />
    </>
  );
};

export default ChatroomList;
