import axios from 'axios';

// API 베이스 URL 설정
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// 타입 정의
interface ChatroomResponse {
  id: number;
  nickname?: string;
  lastMessage?: string;
  isUnread?: boolean;
  time?: string;
  location?: string;
  profileImage?: string;
  roomId?: number;
  userId?: number;
  activeStatus?: boolean;
  joinedAt?: string;
  leftAt?: string | null;
}

interface MessageResponse {
  id: number;
  roomId: number;
  senderId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface LeaveChatroomResponse {
  id: number;
  roomId: number;
  userId: number;
  activeStatus: boolean;
  leftAt: string;
}

// API 클라이언트 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인증 토큰 인터셉터 추가 (JWT나 다른 인증 방식 사용 시)
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// 채팅 관련 API 서비스
const chatApiService = {
  // 사용자의 채팅방 목록 조회
  getChatrooms: async (): Promise<ChatroomResponse[]> => {
    try {
      const response = await apiClient.get<ChatroomResponse[]>('/chatrooms');
      return response.data;
    } catch (error) {
      console.error('채팅방 목록 조회 실패:', error);
      throw error;
    }
  },

  // 특정 채팅방의 메시지 조회
  getChatroomMessages: async (roomId: number): Promise<MessageResponse[]> => {
    try {
      const response = await apiClient.get<MessageResponse[]>(`/chatrooms/${roomId}/messages`);
      return response.data;
    } catch (error) {
      console.error(`채팅방 ${roomId} 메시지 조회 실패:`, error);
      throw error;
    }
  },

  // 메시지 전송
  sendMessage: async (roomId: number, content: string): Promise<MessageResponse> => {
    try {
      const response = await apiClient.post<MessageResponse>(`/chatrooms/${roomId}/messages`, {
        content,
      });
      return response.data;
    } catch (error) {
      console.error(`메시지 전송 실패:`, error);
      throw error;
    }
  },

  // 채팅방 나가기 (active_status를 false로 변경)
  leaveChatroom: async (roomId: number): Promise<LeaveChatroomResponse> => {
    try {
      const response = await apiClient.patch<LeaveChatroomResponse>(`/chat-user/${roomId}/leave`, {
        active_status: false,
        left_at: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error(`채팅방 ${roomId} 나가기 실패:`, error);
      throw error;
    }
  },
};

export default chatApiService;
