// src/services/api/modules/notification.ts
import client from '../client';
import { API_PATHS } from '../../../constants/api';

// 알림 응답 DTO 인터페이스
export interface NotificationResponseDto {
  id: number;
  chatRoomId: number;
  senderId: number;
  senderNickname: string;
  content: string;
  createdAt: string;
  readStatus: boolean;
  unreadCount: number;
}

// 백엔드 응답의 snake_case를 camelCase로 변환하는 인터페이스
export interface NotificationBackendDto {
  id: number;
  chat_room_id: number;
  sender_id: number;
  sender_nickname: string;
  content: string;
  created_at: string;
  read_status: boolean;
  unread_count: number;
}

// API 응답 공통 형식
interface CommonResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * 모든 알림 읽음 처리 API
 * @returns 성공 여부
 */
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const response = await client.put<CommonResponse<null>>(API_PATHS.NOTIFICATION.READ);
    return response.data.success;
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error);
    return false;
  }
};
