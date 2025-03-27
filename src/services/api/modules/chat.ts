// src/services/api/modules/chat.ts
import client from '../client';
import { API_PATHS } from '../../../constants/api';
import axios from 'axios';

// 채팅방 정보 인터페이스
export interface ChatRoom {
  id: number;
  opponent_nickname: string;
  opponent_profile_img?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  post_id?: number;
  post_title?: string;
}

// 채팅 메시지 인터페이스
export interface ChatMessage {
  id: number;
  sender_id: number;
  message: string;
  image_url?: string;
  sent_at: string;
  is_read: boolean;
}

// 채팅방 생성 요청 인터페이스
export interface CreateChatRoomRequest {
  receiver_id: number;
  post_id?: number;
  initial_message?: string;
}

// 채팅방 생성 응답 인터페이스
export interface CreateChatRoomResponse {
  success: boolean;
  message: string;
  data?: {
    chatroom_id: number;
  };
}

// 메시지 전송 요청 인터페이스
export interface SendMessageRequest {
  message: string;
}

// 이미지 메시지 전송 응답 인터페이스
export interface SendImageResponse {
  success: boolean;
  message: string;
  data?: {
    message_id: number;
    image_url: string;
  };
}

/**
 * 채팅방 목록 조회 API
 * @returns 채팅방 목록
 */
export const getChatRooms = async (): Promise<ChatRoom[]> => {
  try {
    const response = await client.get(API_PATHS.CHAT.ROOMS);

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error('채팅방 목록 조회 실패:', error);
    return [];
  }
};

/**
 * 채팅방 상세 정보 조회 API
 * @param roomId 채팅방 ID
 * @returns 채팅방 상세 정보
 */
export const getChatRoomDetail = async (roomId: number) => {
  try {
    const response = await client.get(`${API_PATHS.CHAT.ROOMS}/${roomId}`);
    return response.data;
  } catch (error) {
    console.error('채팅방 상세 정보 조회 실패:', error);
    throw error;
  }
};

/**
 * 채팅 메시지 목록 조회 API
 * @param roomId 채팅방 ID
 * @returns 채팅 메시지 목록
 */
export const getChatMessages = async (roomId: number): Promise<ChatMessage[]> => {
  try {
    const url = API_PATHS.CHAT.MESSAGES.replace(':roomId', roomId.toString());
    const response = await client.get(url);

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error('채팅 메시지 목록 조회 실패:', error);
    return [];
  }
};

/**
 * 텍스트 메시지 전송 API
 * @param roomId 채팅방 ID
 * @param message 전송할 메시지
 * @returns 전송 결과
 */
export const sendMessage = async (roomId: number, message: string) => {
  try {
    const url = API_PATHS.CHAT.SEND.replace(':roomId', roomId.toString());
    const response = await client.post(url, { message });
    return response.data;
  } catch (error) {
    console.error('메시지 전송 실패:', error);
    throw error;
  }
};

/**
 * 이미지 메시지 전송 API
 * @param roomId 채팅방 ID
 * @param imageFile 이미지 파일
 * @returns 전송 결과 및 이미지 URL
 */
export const sendChatImage = async (
  roomId: number,
  imageFile: File,
): Promise<SendImageResponse> => {
  try {
    const url = API_PATHS.CHAT.SEND.replace(':roomId', roomId.toString());

    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('이미지 전송 실패:', error);
    return {
      success: false,
      message: '이미지 전송 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 메시지 읽음 처리 API
 * @param roomId 채팅방 ID
 * @returns 읽음 처리 결과
 */
export const markMessagesAsRead = async (roomId: number) => {
  try {
    const url = `${API_PATHS.CHAT.ROOMS}/${roomId}/read`;
    const response = await client.put(url);
    return response.data;
  } catch (error) {
    console.error('메시지 읽음 처리 실패:', error);
    throw error;
  }
};

/**
 * 채팅방 생성 API
 * @param data 채팅방 생성 요청 데이터
 * @returns 생성된 채팅방 ID
 */
export const createChatRoom = async (
  data: CreateChatRoomRequest,
): Promise<CreateChatRoomResponse> => {
  try {
    const response = await client.post(API_PATHS.CHAT.CREATE, data);
    return response.data;
  } catch (error) {
    console.error('채팅방 생성 실패:', error);
    return {
      success: false,
      message: '채팅방 생성 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 채팅방 나가기(삭제) API
 * @param roomId 채팅방 ID
 * @returns 나가기 처리 결과
 */
export const leaveChatRoom = async (roomId: number) => {
  try {
    const response = await client.delete(`${API_PATHS.CHAT.ROOMS}/${roomId}`);
    return response.data;
  } catch (error) {
    console.error('채팅방 나가기 실패:', error);
    throw error;
  }
};
