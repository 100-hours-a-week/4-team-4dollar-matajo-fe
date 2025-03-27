// src/services/api/modules/chat.ts
import client from '../client';
import { API_PATHS } from '../../../constants/api';
import axios from 'axios';

// 채팅방 생성 응답 타입
export interface ChatRoomCreateResponse {
  success: boolean;
  message: string;
  data: {
    room_id: number;
  };
}

// 채팅방 정보 타입
export interface ChatRoom {
  chatRoomId: number;
  postId: number;
  postTitle: string;
  postAddress: string;
  postMainImage: string;
  userNickname: string;
  lastMessage: string;
  lastMessageTime: string;
  hasUnreadMessages: boolean;
}

// 채팅 메시지 타입
export interface ChatMessage {
  messageId: number;
  roomId: number;
  senderId: number;
  messageContent: string;
  imageUrl?: string;
  sentAt: string;
  isRead: boolean;
}

/**
 * 채팅방 생성 API 함수
 * @param postId 게시글 ID
 * @returns 생성된 채팅방 ID
 */
export const createChatRoom = async (postId: number): Promise<number | null> => {
  try {
    const response = await client.post(API_PATHS.CHAT.CREATE, { post_id: postId });

    if (response.data.success && response.data.data) {
      return response.data.data.room_id;
    }

    return null;
  } catch (error) {
    console.error('채팅방 생성 실패:', error);
    return null;
  }
};

/**
 * 채팅방 목록 조회 API 함수
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
 * 특정 채팅방 정보 조회 API 함수
 * @param roomId 채팅방 ID
 * @returns 채팅방 정보
 */
export const getChatRoomDetail = async (roomId: number): Promise<ChatRoom | null> => {
  try {
    const url = `${API_PATHS.CHAT.ROOMS}/${roomId}`;
    const response = await client.get(url);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    return null;
  } catch (error) {
    console.error('채팅방 상세 정보 조회 실패:', error);
    return null;
  }
};

/**
 * 채팅 메시지 목록 조회 API 함수
 * @param roomId 채팅방 ID
 * @param page 페이지 번호 (기본값: 0)
 * @param size 페이지 크기 (기본값: 20)
 * @returns 채팅 메시지 목록
 */
export const getChatMessages = async (
  roomId: number,
  page: number = 0,
  size: number = 20,
): Promise<{ messages: ChatMessage[]; hasMore: boolean }> => {
  try {
    const url = API_PATHS.CHAT.MESSAGES.replace(':roomId', roomId.toString());
    const response = await client.get(url, {
      params: { page, size },
    });

    if (response.data.success && response.data.data) {
      return {
        messages: response.data.data.messages,
        hasMore: response.data.data.hasMore,
      };
    }

    return { messages: [], hasMore: false };
  } catch (error) {
    console.error('채팅 메시지 목록 조회 실패:', error);
    return { messages: [], hasMore: false };
  }
};

/**
 * 채팅 메시지 전송 API 함수
 * @param roomId 채팅방 ID
 * @param content 메시지 내용
 * @returns 전송 결과
 */
export const sendMessage = async (
  roomId: number,
  content: string,
): Promise<{ success: boolean; messageId?: number }> => {
  try {
    const url = API_PATHS.CHAT.SEND.replace(':roomId', roomId.toString());
    const response = await client.post(url, { content });

    if (response.data.success && response.data.data) {
      return {
        success: true,
        messageId: response.data.data.message_id,
      };
    }

    return { success: false };
  } catch (error) {
    console.error('채팅 메시지 전송 실패:', error);
    return { success: false };
  }
};

/**
 * 채팅 이미지 전송 API 함수
 * @param roomId 채팅방 ID
 * @param imageFile 이미지 파일
 * @returns 전송 결과
 */
export const sendChatImage = async (
  roomId: number,
  imageFile: File,
): Promise<{ success: boolean; messageId?: number; imageUrl?: string }> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const url = API_PATHS.CHAT.SEND.replace(':roomId', roomId.toString());
    const response = await client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success && response.data.data) {
      return {
        success: true,
        messageId: response.data.data.message_id,
        imageUrl: response.data.data.image_url,
      };
    }

    return { success: false };
  } catch (error) {
    console.error('채팅 이미지 전송 실패:', error);
    return { success: false };
  }
};

/**
 * 메시지 읽음 처리 API 함수
 * @param roomId 채팅방 ID
 * @returns 처리 결과
 */
export const markMessagesAsRead = async (roomId: number): Promise<boolean> => {
  try {
    await client.post(`${API_PATHS.CHAT.ROOMS}/${roomId}/read`);
    return true;
  } catch (error) {
    console.error('메시지 읽음 처리 실패:', error);
    return false;
  }
};

/**
 * 채팅방 나가기 API 함수
 * @param roomId 채팅방 ID
 * @returns 처리 결과
 */
export const leaveChatRoom = async (roomId: number): Promise<boolean> => {
  try {
    await client.delete(`${API_PATHS.CHAT.ROOMS}/${roomId}`);
    return true;
  } catch (error) {
    console.error('채팅방 나가기 실패:', error);
    return false;
  }
};
