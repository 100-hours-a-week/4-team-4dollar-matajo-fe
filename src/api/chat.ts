import axios from 'axios';

// API 베이스 URL 설정
//const API_BASE_URL = 'http://15.164.251.118:8080/api/chat';
const API_BASE_URL = 'https://cors-anywhere.herokuapp.com/http://15.164.251.118:8080/api/chat';
// 공통 응답 인터페이스
interface CommonResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// 채팅방 상세 정보 인터페이스
interface ChatroomDetailResponse {
  room_id: number;
  post_id: number;
  post_title: string;
  post_main_image: string;
  post_address: string;
  prefer_price: number;
  keeper_id: number;
  keeper_nickname: string;
  client_id: number;
  client_nickname: string;
}

// 채팅방 응답 인터페이스
interface ChatroomResponse {
  id?: number;
  room_id?: number;
  nickname?: string;
  lastMessage?: string;
  isUnread?: boolean;
  time?: string;
  location?: string;
  profileImage?: string;
  postId?: number;
  lastMessageTime?: string;
  otherUserId?: number;
  post_address?: string;
  post_main_image?: string;
}

// 메시지 응답 인터페이스
interface MessageResponse {
  id: number;
  roomId?: number;
  room_id?: number;
  senderId?: number;
  sender_id?: number;
  content: string;
  createdAt?: string;
  created_at?: string;
  isRead?: boolean;
  messageType?: 'TEXT' | 'IMAGE';
  message_type?: 'TEXT' | 'IMAGE';
}

// API 클라이언트 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // CORS 쿠키 및 인증 처리
});

// 디버그 인터셉터 추가
apiClient.interceptors.request.use(
  config => {
    console.log('Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
    });

    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  response => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data.data,
    });
    return response;
  },
  error => {
    console.error('Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
);

const chatApiService = {
  // 사용자의 채팅방 목록 조회
  getChatrooms: async (): Promise<ChatroomResponse[]> => {
    try {
      const userId = localStorage.getItem('user_id');
      const response = await apiClient.get<CommonResponse<ChatroomResponse[]>>('', {
        params: { userId },
      });

      // 응답 데이터 로깅하여 구조 확인
      console.log('채팅방 목록 원본 데이터:', response.data);

      // 데이터 구조에 따라 필드 매핑 처리
      // API 응답 구조가 다를 수 있으므로 필드명을 확인하고 매핑
      const processedData = response.data.data.map((room: any) => {
        // 실제 필드명을 확인하여 매핑
        return {
          id: room.room_id || room.chat_room_id || room.id || 0,
          nickname:
            room.client_nickname ||
            room.keeper_nickname ||
            room.user_nickname ||
            room.nickname ||
            '사용자',
          lastMessage: room.last_message || room.lastMessage || '메시지가 없습니다',
          isUnread: room.unread_count > 0 || room.isUnread || false,
          time: room.last_message_time || room.lastMessageTime || '',
          location: room.post_address || room.location || '위치 정보 없음',
          profileImage: room.post_main_image || room.profileImage || 'https://placehold.co/69x66',
        };
      });

      console.log('처리된 채팅방 목록 데이터:', processedData);
      return processedData;
    } catch (error) {
      console.error('채팅방 목록 조회 실패:', error);
      return []; // 빈 배열로 처리
    }
  },

  // 특정 채팅방의 메시지 조회
  getChatroomMessages: async (roomId: number): Promise<MessageResponse[]> => {
    try {
      console.log(`채팅방 ${roomId}의 메시지 로드 시작`);

      // 로컬 스토리지에서 메시지 가져오기 (테스트용)
      const roomKey = `chat_room_${roomId}_messages`;
      const storedMessages = JSON.parse(localStorage.getItem(roomKey) || '[]');

      console.log('로컬 저장된 메시지:', storedMessages);
      return storedMessages;
    } catch (error) {
      console.error(`채팅방 ${roomId} 메시지 로드 실패:`, error);
      return [];
    }
  },
  // chat.ts의 sendMessage 함수를 다음과 같이 수정해 보세요
  sendMessage: async (roomId: number, content: string): Promise<MessageResponse | null> => {
    try {
      console.log(`메시지 전송 시도: roomId=${roomId}, content=${content}`);

      const userId = localStorage.getItem('user_id');
      console.log(`사용자 ID: ${userId}`);

      // CORS 및 서버 오류 우회: 로컬에서 처리
      console.log('서버 API 호출 대신 로컬에서 처리합니다.');

      // 임시 응답 객체 생성
      const tempResponse: MessageResponse = {
        id: Date.now(),
        roomId: roomId,
        senderId: parseInt(userId || '1', 10),
        content: content,
        createdAt: new Date().toISOString(),
        isRead: false,
        messageType: 'TEXT',
      };

      // 로컬 스토리지에 메시지 저장 (테스트용)
      const roomKey = `chat_room_${roomId}_messages`;
      const storedMessages = JSON.parse(localStorage.getItem(roomKey) || '[]');
      storedMessages.push(tempResponse);
      localStorage.setItem(roomKey, JSON.stringify(storedMessages));

      console.log('메시지 로컬 저장 완료:', tempResponse);
      return tempResponse;
    } catch (error) {
      console.error('메시지 처리 실패:', error);
      return null;
    }
  },

  // 이미지 업로드
  uploadImage: async (file: File): Promise<string> => {
    // 파일 유효성 검사
    if (!file) {
      throw new Error('이미지 파일이 선택되지 않았습니다.');
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('이미지 크기는 10MB 이하여야 합니다.');
      throw new Error('이미지 크기 초과');
    }

    // 파일 타입 확인
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      alert('JPEG, PNG, GIF, WEBP 형식의 이미지만 업로드 가능합니다.');
      throw new Error('지원되지 않는 이미지 형식');
    }

    try {
      const formData = new FormData();
      formData.append('chatImage', file);

      const response = await apiClient.post<CommonResponse<string>>('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('이미지 업로드 실패:', error);

      // 에러 메시지 처리
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || '이미지 업로드에 실패했습니다.';
        alert(errorMessage);
      }

      throw error;
    }
  },

  // 이미지 메시지 전송
  sendImageMessage: async (roomId: number, imageUrl: string): Promise<MessageResponse | null> => {
    try {
      const userId = localStorage.getItem('user_id');
      const response = await apiClient.post<CommonResponse<MessageResponse>>(`/${roomId}/message`, {
        senderId: parseInt(userId || '0', 10),
        content: imageUrl,
        messageType: 'IMAGE',
      });
      return response.data.data;
    } catch (error) {
      console.error(`이미지 메시지 전송 실패:`, error);
      return null;
    }
  },

  // 채팅방 나가기
  leaveChatroom: async (roomId: number): Promise<boolean> => {
    try {
      const userId = localStorage.getItem('user_id');
      await apiClient.delete(`/${roomId}`, {
        params: { userId: parseInt(userId || '0', 10) },
      });
      return true;
    } catch (error) {
      console.error(`채팅방 ${roomId} 나가기 실패:`, error);
      return false;
    }
  },

  // 메시지 읽음 처리
  markMessagesAsRead: async (roomId: number): Promise<boolean> => {
    try {
      const userId = localStorage.getItem('user_id');
      await apiClient.put(`/${roomId}/read`, null, {
        params: { userId },
      });
      return true;
    } catch (error) {
      console.error(`메시지 읽음 처리 실패:`, error);
      return false;
    }
  },

  // 채팅방 생성
  createChatRoom: async (postId: number): Promise<number | null> => {
    try {
      const userId = localStorage.getItem('user_id');
      const response = await apiClient.post<CommonResponse<{ roomId: number }>>('', {
        postId,
        userId: parseInt(userId || '0', 10),
      });
      return response.data.data.roomId;
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      return null;
    }
  },

  // 채팅방 상세 정보 조회
  getChatroomDetail: async (roomId: number): Promise<ChatroomDetailResponse | null> => {
    try {
      const response = await apiClient.get<CommonResponse<ChatroomDetailResponse>>(`/${roomId}`);
      console.log('채팅방 상세 정보:', response.data);
      return response.data.data;
    } catch (error) {
      console.error(`채팅방 ${roomId} 상세 정보 조회 실패:`, error);
      return null;
    }
  },
};

export default chatApiService;
