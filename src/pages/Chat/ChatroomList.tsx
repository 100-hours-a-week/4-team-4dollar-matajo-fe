import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import Modal from '../../components/common/Modal';
import chatApiService from '../../api/chat';

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
  width: 375px;
  height: calc(100vh - 76px); /* 네비게이션 바 높이 제외 */
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 76px; /* 하단 네비게이션 높이만큼 마진 */
  padding-top: 30px; /* 헤더 높이만큼 패딩 */
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
const ProfileImage = styled.div`
  width: 69px;
  height: 66px;
  border-radius: 2px;
  background-color: #f0f0f0;
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

// 채팅방 데이터 타입 정의
interface ChatroomData {
  id: number;
  nickname: string;
  lastMessage: string;
  isUnread: boolean;
  time: string;
  location: string;
  profileImage?: string;
}

// API 응답 타입 정의
interface ChatroomResponse {
  id: number;
  nickname?: string;
  lastMessage?: string;
  isUnread?: boolean;
  time?: string;
  location?: string;
  profileImage?: string;
  // 서버에서 추가로 제공할 수 있는 필드들
  roomId?: number;
  userId?: number;
  activeStatus?: boolean;
  joinedAt?: string;
  leftAt?: string | null;
}

const ChatroomList: React.FC = () => {
  // 네비게이션
  const navigate = useNavigate();

  // 채팅방 데이터 상태
  const [chatrooms, setChatrooms] = useState<ChatroomData[]>([]);

  // 로딩 상태
  const [loading, setLoading] = useState(true);

  // 채팅방 목록 불러오기
  useEffect(() => {
    const fetchChatrooms = async () => {
      try {
        setLoading(true);
        // API에서 채팅방 목록 불러오기
        const response = await chatApiService.getChatrooms();

        // 데이터 형식 맞추기
        const formattedData = response.map(
          (room: ChatroomResponse): ChatroomData => ({
            id: room.id,
            nickname: room.nickname || '닉네임 최대',
            lastMessage: room.lastMessage || '내용의최대글자수는얼마나될까...',
            isUnread: room.isUnread || false,
            time: room.time || '04:21',
            location: room.location || '남양읍',
            profileImage: room.profileImage || 'https://placehold.co/69x66',
          }),
        );

        setChatrooms(formattedData);
      } catch (error) {
        console.error('채팅방 목록 불러오기 실패:', error);
        // 오류 발생 시 더미 데이터 사용
        setChatrooms([
          {
            id: 1,
            nickname: '닉네임 최대',
            lastMessage: '내용의최대글자수는얼마나될까...',
            isUnread: false,
            time: '04:21',
            location: '남양읍',
            profileImage: 'https://placehold.co/69x66',
          },
          {
            id: 2,
            nickname: '닉네임 최대',
            lastMessage: '내용의최대글자수는얼마나될까...',
            isUnread: false,
            time: '04:21',
            location: '남양읍',
            profileImage: 'https://placehold.co/69x66',
          },
          {
            id: 3,
            nickname: '닉네임 최대',
            lastMessage: '내용의최대글자수는얼마나될까...',
            isUnread: true,
            time: '04:21',
            location: '남양읍',
            profileImage: 'https://placehold.co/69x66',
          },
          {
            id: 4,
            nickname: '닉네임 최대',
            lastMessage: '내용의최대글자수는얼마나될까...',
            isUnread: false,
            time: '04:21',
            location: '남양읍',
            profileImage: 'https://placehold.co/69x66',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchChatrooms();
  }, []);

  // 모달 상태
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedChatroomId, setSelectedChatroomId] = useState<number | null>(null);
  const [pressedChatroomId, setPressedChatroomId] = useState<number | null>(null);

  // 롱 프레스 관련 상태 및 타이머 참조
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  // 채팅방 나가기 진행 상태
  const [leavingChatroomId, setLeavingChatroomId] = useState<number | null>(null);

  // 채팅방 클릭 핸들러
  const handleChatroomClick = (id: number) => {
    if (!isLongPress) {
      console.log(`채팅방 ${id} 클릭됨`);
      navigate(`/chat`);
    }
    // 롱 프레스 상태 초기화
    setIsLongPress(false);
  };

  // 터치 시작 핸들러
  const handleTouchStart = (id: number) => {
    setPressedChatroomId(id);
    longPressTimeoutRef.current = setTimeout(() => {
      setIsLongPress(true);
      setSelectedChatroomId(id);
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
  const handleMouseDown = (id: number) => {
    setPressedChatroomId(id);
    longPressTimeoutRef.current = setTimeout(() => {
      setIsLongPress(true);
      setSelectedChatroomId(id);
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

  // 컴포넌트 언마운트 시 타이머 클리어
  useEffect(() => {
    return () => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);

  // 채팅방 나가기 확인 핸들러
  const handleLeaveChatroom = async () => {
    if (selectedChatroomId) {
      try {
        // 나가기 진행 중 상태 설정
        setLeavingChatroomId(selectedChatroomId);

        // 모달 닫기 (진행 중 UI는 채팅방 리스트에 표시)
        setIsLeaveModalOpen(false);

        // API 호출로 active_status를 false로 변경
        await chatApiService.leaveChatroom(selectedChatroomId);

        // 화면 상에서는 해당 채팅방을 제거
        setChatrooms(prev => prev.filter(room => room.id !== selectedChatroomId));
        console.log(`채팅방 ${selectedChatroomId} 나가기 처리됨`);
      } catch (error) {
        console.error(`채팅방 나가기 실패:`, error);
        // 오류 처리 - 사용자에게 알림 등
        alert('채팅방 나가기에 실패했습니다. 다시 시도해주세요.');
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
    if (message.length > 14) {
      return `${message.substring(0, 14)}...`;
    }
    return message;
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
        {/* 로딩 상태 표시 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>채팅방 목록을 불러오는 중...</div>
        ) : chatrooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: THEME.grayText }}>
            참여 중인 채팅방이 없습니다.
          </div>
        ) : (
          /* 채팅방 목록 */
          chatrooms.map(chatroom => (
            <ChatroomItem
              key={chatroom.id}
              isPressed={pressedChatroomId === chatroom.id}
              onClick={() => handleChatroomClick(chatroom.id)}
              onTouchStart={() => handleTouchStart(chatroom.id)}
              onTouchEnd={handleTouchEnd}
              onMouseDown={() => handleMouseDown(chatroom.id)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                opacity: leavingChatroomId === chatroom.id ? 0.6 : 1,
                position: 'relative',
              }}
            >
              <ProfileImage>
                {chatroom.profileImage ? (
                  <img
                    src={chatroom.profileImage}
                    alt="프로필 이미지"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span>
                    장소
                    <br />
                    이미지
                  </span>
                )}
              </ProfileImage>

              <ChatInfo>
                <TopInfo>
                  <Nickname>{chatroom.nickname}</Nickname>
                  <Time>{chatroom.time}</Time>
                </TopInfo>

                <MessageContent isUnread={chatroom.isUnread}>
                  {formatMessage(chatroom.lastMessage)}
                </MessageContent>

                <Location>{chatroom.location}</Location>
              </ChatInfo>

              {/* 나가기 진행 중 상태 표시 */}
              {leavingChatroomId === chatroom.id && (
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
