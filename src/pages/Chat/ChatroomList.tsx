import React from 'react';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#3A00E5',
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
const ChatroomItem = styled.div`
  width: 327px;
  position: relative;
  margin: 0 auto;
  padding: 20px 0;
  display: flex;
  border-bottom: 1px solid ${THEME.borderColor};
  cursor: pointer;
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

const ChatroomList: React.FC = () => {
  // 더미 채팅방 데이터
  const chatrooms: ChatroomData[] = [
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
  ];

  // 채팅방 클릭 핸들러
  const handleChatroomClick = (id: number) => {
    console.log(`채팅방 ${id} 클릭됨`);
    // 채팅방 상세 페이지로 이동하는 로직 추가
  };

  // 메시지 내용 가공 (14자 이상이면 ... 처리)
  const formatMessage = (message: string) => {
    if (message.length > 14) {
      return `${message.substring(0, 14)}...`;
    }
    return message;
  };

  return (
    <>
      {/* 상단 헤더 */}
      <Header title="채팅 리스트" showBackButton={true} />

      <Container>
        {/* 채팅방 목록 */}
        {chatrooms.map(chatroom => (
          <ChatroomItem key={chatroom.id} onClick={() => handleChatroomClick(chatroom.id)}>
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
          </ChatroomItem>
        ))}
      </Container>

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="채팅" />
    </>
  );
};

export default ChatroomList;
