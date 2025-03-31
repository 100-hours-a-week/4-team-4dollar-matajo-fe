import SockJS from 'sockjs-client';
import { Client, IFrame, IMessage, StompSubscription } from '@stomp/stompjs';
import client from '../services/api/client';
import { API_BACKEND_URL, API_PATHS } from '../constants/api';
import { getUserId } from '../utils/formatting/decodeJWT';
import axios from 'axios';

// 메시지 타입 정의 - 백엔드와 일치
export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  SYSTEM = 'SYSTEM',
}

// 백엔드 DTO와 일치하는 인터페이스 정의
export interface ChatMessageRequestDto {
  senderId: number; // 카멜케이스로 변경
  content: string;
  messageType: MessageType; // 카멜케이스로 변경
}

// 백엔드 응답과 일치하도록 수정
export interface ChatMessageResponseDto {
  messageId: number; // 카멜케이스로 변경
  roomId: number; // 카멜케이스로 변경
  senderId: number; // 카멜케이스로 변경
  content: string;
  messageType: MessageType; // 카멜케이스로 변경
  readStatus: boolean; // 카멜케이스로 변경
  createdAt: string; // 카멜케이스로 변경
  senderNickname: string; // 카멜케이스로 변경
}

// 채팅방 응답 DTO - 백엔드와 일치하도록 수정
export interface ChatRoomResponseDto {
  chatRoomId: number;
  keeperStatus: boolean;
  userNickname: string;
  postMainImage: string;
  postAddress: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

// 백엔드 응답 형식에 맞는 인터페이스 추가
interface ChatRoomBackendDto {
  chat_room_id: number;
  keeper_status: boolean;
  user_nickname: string;
  post_main_image: string;
  post_address: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

// 채팅방 생성 요청 인터페이스
interface CreateChatRoomRequest {
  post_id: number;
}

// 채팅방 생성 응답 인터페이스
interface CreateChatRoomResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
  };
}

// API 응답 공통 형식
interface CommonResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface TradeData {
  itemName: string;
  price: number;
  startDate: string;
  storagePeriod: number;
  endDate: string;
  itemTypes: string[]; // Changed from string to string[]
  category: string;
}

// Add this interface for the response from the trade confirmation API
export interface TradeConfirmationResponseDto {
  tradeId: number;
  status: string;
}

class ChatService {
  private static instance: ChatService;
  private stompClient: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private connectionCallbacks: (() => void)[] = [];
  private errorCallbacks: ((error: string) => void)[] = [];
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 3000; // 3초

  // 싱글톤 인스턴스 얻기
  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private constructor() {
    // private constructor to enforce singleton pattern
  }

  // 연결 상태를 더 명확하게 관리
  private connectionPromise: Promise<boolean> | null = null;

  private getUserIdFromToken(): string {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('인증이 필요합니다.');
    }

    const userId = getUserId(accessToken);
    if (userId === null) {
      throw new Error('유효하지 않은 토큰입니다.');
    }

    return userId.toString();
  }

  // WebSocket 연결
  public connect(): Promise<boolean> {
    // 이미 연결 중인 경우 진행 중인 Promise 반환
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // 이미 연결된 경우 즉시 성공 반환
    if (this.connectionStatus === 'connected' && this.stompClient?.connected) {
      return Promise.resolve(true);
    }

    // 새로운 연결 Promise 생성 및 저장
    this.connectionPromise = new Promise((resolve, reject) => {
      this.connectionStatus = 'connecting';
      console.log('연결 시도 중...');

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('인증이 필요합니다.');
      }

      const userId = getUserId(accessToken);
      if (userId === null) {
        throw new Error('유효하지 않은 토큰입니다.');
      }

      try {
        // SockJS 옵션 설정
        const sockJSOptions: any = {
          transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
          timeout: 10000,
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            userId: userId, // WebSocket 연결 시 userId 헤더 추가
            Authorization: `Bearer ${accessToken}`,
          },
        };

        // STOMP 클라이언트 생성
        this.stompClient = new Client({
          webSocketFactory: () =>
            new SockJS(
              `${API_BACKEND_URL}/ws-chat?userId=${userId}&token=${accessToken}`,
              null,
              sockJSOptions,
            ),
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          connectHeaders: {
            'X-Requested-With': 'XMLHttpRequest',
            userId: userId.toString(),
            Authorization: `Bearer ${accessToken}`,
          },

          debug: msg => {
            if (process.env.NODE_ENV === 'development') {
              console.log('STOMP Debug:', msg);
            }
          },

          // 연결 성공 콜백
          onConnect: (frame: IFrame) => {
            console.log('WebSocket 연결 성공!');
            this.connectionStatus = 'connected';
            this.reconnectAttempts = 0;
            this.connectionCallbacks.forEach(callback => callback());

            // 연결 Promise 초기화
            this.connectionPromise = null;
            resolve(true);
          },

          onStompError: (frame: IFrame) => {
            console.error('STOMP 프로토콜 에러:', frame.headers, frame.body);
            const errorMessage = frame.headers['message'] || 'Unknown STOMP error';
            this.errorCallbacks.forEach(callback => callback(errorMessage));

            // 연결 Promise 초기화
            this.connectionPromise = null;
            reject(new Error(errorMessage));
          },

          onDisconnect: () => {
            console.log('STOMP 연결 종료');
            this.connectionStatus = 'disconnected';

            // 연결 Promise 초기화
            this.connectionPromise = null;
          },

          onWebSocketError: (error: Event) => {
            console.error('WebSocket 에러:', error);
            this.connectionStatus = 'disconnected';
            const errorMessage =
              error instanceof Error ? error.message : 'WebSocket connection error';
            this.errorCallbacks.forEach(callback => callback(errorMessage));

            // 연결 Promise 초기화
            this.connectionPromise = null;
            this.scheduleReconnect();
            reject(error);
          },
        });

        // 연결 시작
        this.stompClient.activate();
      } catch (e) {
        console.error('WebSocket 연결 설정 에러:', e);
        this.connectionStatus = 'disconnected';

        // 연결 Promise 초기화
        this.connectionPromise = null;
        this.scheduleReconnect();
        reject(e);
      }
    });

    return this.connectionPromise;
  }

  // 채팅방 구독 함수 개선
  public async subscribeToChatRoom(
    roomId: number,
    callback: (message: ChatMessageResponseDto) => void,
  ): Promise<void> {
    // 연결 상태 확인 및 재연결
    if (!this.isConnected()) {
      console.log('구독을 위해 연결 시도 중...');
      try {
        await this.connect();
      } catch (error) {
        console.error('구독을 위한 연결 실패:', error);
        throw error;
      }
    }

    // 연결 확인
    if (!this.stompClient?.connected) {
      console.error('연결 시도 후에도 STOMP 클라이언트 연결 안됨');
      throw new Error('구독을 위한 STOMP 클라이언트 연결 실패');
    }

    // 이미 구독 중인 경우 해제
    const subscriptionId = `sub-${roomId}`;
    if (this.subscriptions.has(subscriptionId)) {
      console.log(`이미 구독 중인 채팅방 해제: ${roomId}`);
      this.unsubscribeFromChatRoom(roomId);
    }

    console.log(`채팅방 구독 시작: ${roomId}`);

    try {
      // 채팅방 구독
      const subscription = this.stompClient.subscribe(
        `/topic/chat/${roomId}`,
        (message: IMessage) => {
          try {
            console.log(`새 메시지 수신 (roomId: ${roomId}):`, message.body);

            // 메시지가 비어있으면 무시
            if (!message.body) {
              console.warn('빈 메시지 수신됨');
              return;
            }

            const parsedData = JSON.parse(message.body);
            console.log('파싱된 메시지:', parsedData);

            // 다양한 메시지 포맷 처리
            let messageData: ChatMessageResponseDto;

            if (parsedData.success !== undefined && parsedData.data) {
              messageData = this.convertToMessageFormat(parsedData.data);
            } else if (parsedData.message_id !== undefined || parsedData.messageId !== undefined) {
              messageData = this.convertToMessageFormat(parsedData);
            } else if (parsedData.content !== undefined) {
              messageData = this.convertToMessageFormat(parsedData);
            } else {
              console.warn('예상치 못한 메시지 형식:', parsedData);
              return;
            }

            // 콜백 호출
            callback(messageData);
          } catch (error) {
            console.error('메시지 처리 에러:', error, '원시 메시지:', message.body);
          }
        },
        { id: subscriptionId },
      );

      this.subscriptions.set(subscriptionId, subscription);
      console.log(`채팅방 구독 성공: ${roomId}`);
    } catch (error) {
      console.error(`채팅방 구독 에러 (roomId: ${roomId}):`, error);
      throw error;
    }
  }

  // 통합 메시지 변환 함수
  private convertToMessageFormat(data: any): ChatMessageResponseDto {
    // 현재 시간을 ISO 문자열로 변환
    const now = new Date().toISOString();

    return {
      messageId: data.messageId || data.message_id,
      roomId: data.roomId || data.room_id,
      senderId: data.senderId || data.sender_id,
      content: data.content,
      messageType: data.messageType || data.message_type,
      readStatus: data.readStatus || data.read_status,
      createdAt: data.createdAt || data.created_at,
      senderNickname: data.senderNickname || data.sender_nickname,
    };
  }

  // 채팅방 구독 해제
  public unsubscribeFromChatRoom(roomId: number): void {
    const subscriptionId = `sub-${roomId}`;
    const subscription = this.subscriptions.get(subscriptionId);

    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
    }
  }

  // 텍스트 메시지 전송 - 수정된 DTO 형식 사용
  public sendTextMessage(roomId: number, senderId: number, content: string): Promise<boolean> {
    return this.sendMessage(roomId, {
      senderId: senderId,
      content: content,
      messageType: MessageType.TEXT,
    });
  }

  // 텍스트 메시지 전송 - 수정된 DTO 형식 사용
  public sendSystemMessage(roomId: number, content: string): Promise<boolean> {
    // Use a pseudo sender ID for system messages (e.g., 0 or -1)
    const systemSenderId = 0;

    return this.sendMessage(roomId, {
      senderId: systemSenderId,
      content: content,
      messageType: MessageType.SYSTEM,
    });
  }

  // 이미지 메시지 전송 - 수정된 DTO 형식 사용
  public sendImageMessage(roomId: number, senderId: number, imageUrl: string): Promise<boolean> {
    return this.sendMessage(roomId, {
      senderId: senderId,
      content: imageUrl,
      messageType: MessageType.IMAGE,
    });
  }

  // 메시지 전송 개선
  private async sendMessage(roomId: number, message: ChatMessageRequestDto): Promise<boolean> {
    // 연결 상태 확인 및 재연결 시도
    if (!this.isConnected()) {
      console.log('STOMP 클라이언트가 연결되어 있지 않음. 연결 시도 중...');
      try {
        await this.connect();
      } catch (error) {
        console.error('메시지 전송을 위한 연결 실패:', error);
        throw error;
      }
    }

    // 다시 연결 상태 검증
    if (!this.stompClient?.connected) {
      console.error('연결 시도 후에도 STOMP 클라이언트 연결 안됨');
      throw new Error('STOMP 클라이언트 연결 실패');
    }

    try {
      console.log(`메시지 전송 중 (roomId: ${roomId})...`);

      // 백엔드 형식에 맞춰 변환
      const backendMessage = {
        sender_id: message.senderId,
        content: message.content,
        message_type: message.messageType,
      };

      const userId = this.getUserIdFromToken();

      // 메시지 전송 - userId 헤더 추가
      this.stompClient.publish({
        destination: `/app/${roomId}/message`,
        body: JSON.stringify(backendMessage),
        headers: {
          'content-type': 'application/json',
          userId: userId,
        },
      });

      console.log('메시지 전송 성공', backendMessage);
      return true;
    } catch (error) {
      console.error('메시지 전송 에러:', error);
      throw error;
    }
  }

  // 이전 메시지 로드 - axios 사용으로 변경 및 응답 변환 로직 추가
  public loadMessages(
    roomId: number,
    page: number = 0,
    size: number = 50,
  ): Promise<ChatMessageResponseDto[]> {
    const url = API_PATHS.CHAT.MESSAGES.replace(':roomId', roomId.toString());
    return client
      .get<CommonResponse<any[]>>(url, {
        params: { page, size },
      })
      .then(response => {
        if (response.data.success && response.data.data) {
          // 백엔드 응답을 프론트엔드 형식으로 변환
          return response.data.data.map(item => this.convertToMessageFormat(item));
        }
        console.error('Error loading messages:', response.data.message);
        return [];
      })
      .catch(error => {
        console.error('Error fetching messages:', error);
        return [];
      });
  }

  // 채팅방 목록 로드 - 응답 변환 로직 추가
  public async loadChatRooms(): Promise<ChatRoomResponseDto[]> {
    try {
      const response = await client.get<CommonResponse<ChatRoomBackendDto[]>>('/api/chats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.data.success && response.data.data) {
        // 백엔드 응답을 프론트엔드 형식으로 변환
        return response.data.data.map(room => ({
          chatRoomId: room.chat_room_id,
          keeperStatus: room.keeper_status,
          userNickname: room.user_nickname,
          postMainImage: room.post_main_image,
          postAddress: room.post_address,
          lastMessage: room.last_message,
          lastMessageTime: room.last_message_time,
          unreadCount: room.unread_count,
        }));
      }
      return [];
    } catch (error) {
      console.error('채팅방 목록 로드 실패:', error);
      throw error;
    }
  }

  // 채팅방 생성 메서드 수정
  public async createChatRoom(request: CreateChatRoomRequest): Promise<CreateChatRoomResponse> {
    try {
      const response = await client.post<CreateChatRoomResponse>('/api/chats', request, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      throw error;
    }
  }

  // 채팅방 나가기 메서드 수정
  public async leaveChatRoom(roomId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await client.delete<CommonResponse<null>>(
        `${API_PATHS.CHAT.ROOMS}/${roomId}`,
      );
      return {
        success: response.data.success,
        message: response.data.message,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const response = error.response?.data;
        // API 명세에 따른 에러 처리
        switch (error.response?.status) {
          case 400:
            console.error('잘못된 채팅방 ID');
            return { success: false, message: 'invalid_chat_room_id' };
          case 401:
            console.error('인증 필요');
            return { success: false, message: 'required_authorization' };
          case 403:
            console.error('권한 없음 (보관인은 나갈 수 없음)');
            return { success: false, message: 'required_permission' };
          case 404:
            console.error('채팅방 또는 사용자를 찾을 수 없음');
            return { success: false, message: response?.message || 'not_found_chat_room' };
          case 409:
            console.error('이미 나간 채팅방');
            return { success: false, message: 'chat_user_already_left' };
          default:
            console.error('서버 에러');
            return { success: false, message: 'internal_server_error' };
        }
      }
      return { success: false, message: 'internal_server_error' };
    }
  }

  // 메시지 읽음 처리 - 수정된 파라미터 이름
  public markMessagesAsRead(roomId: number, userId: number): Promise<boolean> {
    return client
      .put<CommonResponse<null>>(`/api/chat/${roomId}/read`, null, {
        params: { userId },
      })
      .then(response => {
        return response.data.success === true;
      })
      .catch(error => {
        console.error('Error marking messages as read:', error);
        return false;
      });
  }

  // 이미지 업로드
  public uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('chatImage', file);

    return client
      .post<CommonResponse<string>>(API_PATHS.CHAT.UPLOAD_IMAGE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .then(response => {
        if (response.data.success && response.data.data) {
          return response.data.data;
        }
        throw new Error(response.data.message || '이미지 업로드에 실패했습니다');
      });
  }

  public confirmTrade(roomId: number, tradeData: TradeData): Promise<number> {
    const url = `${API_PATHS.CHAT.TRADE_INFO}`;

    // Prepare data in the format expected by backend
    const requestData = {
      room_id: roomId,
      product_name: tradeData.itemName,
      category: tradeData.category,
      start_date: tradeData.startDate,
      storage_period: tradeData.storagePeriod,
      trade_price: tradeData.price,
    };

    console.log('Sending trade confirmation:', requestData);

    return client
      .post<CommonResponse<TradeConfirmationResponseDto>>(url, requestData)
      .then(response => {
        if (response.data.success && response.data.data) {
          console.log('Trade confirmation successful:', response.data.data);
          return response.data.data.tradeId;
        }
        throw new Error(response.data.message || 'Failed to confirm trade');
      })
      .catch(error => {
        console.error('Error confirming trade:', error);
        throw error;
      });
  }

  // 연결 상태 이벤트 리스너 추가
  public onConnect(callback: () => void): void {
    this.connectionCallbacks.push(callback);
    if (this.connectionStatus === 'connected') {
      callback();
    }
  }

  // 에러 이벤트 리스너 추가
  public onError(callback: (error: string) => void): void {
    this.errorCallbacks.push(callback);
  }

  // 연결 해제
  public disconnect(): void {
    if (this.stompClient && this.stompClient.connected) {
      // 모든 구독 해제
      this.subscriptions.forEach(subscription => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      // STOMP 클라이언트 비활성화
      this.stompClient.deactivate();
      this.connectionStatus = 'disconnected';
    }

    // 재연결 타이머 해제
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  // 재연결 스케줄링
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      const delay = this.RECONNECT_DELAY * Math.pow(1.5, this.reconnectAttempts - 1); // 지수 백오프
      console.log(
        `Scheduling reconnect attempt ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS} in ${delay}ms`,
      );

      this.reconnectTimeout = setTimeout(() => {
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`,
        );
        this.connect().catch(err => {
          console.error('Reconnection failed:', err);
          // 실패 시 다음 재연결 시도 예약됨
        });
      }, delay);
    } else {
      console.error(`Maximum reconnect attempts (${this.MAX_RECONNECT_ATTEMPTS}) reached`);
      this.errorCallbacks.forEach(callback =>
        callback('연결 시도 횟수 초과. 새로고침 후 다시 시도해주세요.'),
      );
    }
  }

  // 연결 상태 확인 함수 개선
  public isConnected(): boolean {
    const connected =
      this.connectionStatus === 'connected' &&
      this.stompClient !== null &&
      this.stompClient.connected;

    console.log(
      `연결 상태 확인: ${connected ? '연결됨' : '연결 안됨'} (내부 상태: ${this.connectionStatus}, stompClient 존재: ${this.stompClient !== null}, stompClient.connected: ${this.stompClient?.connected})`,
    );

    return connected;
  }

  // 연결 리스너 제거 메서드
  public removeConnectListener(callback: () => void): void {
    this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
  }

  // 에러 리스너 제거 메서드
  public removeErrorListener(callback: (error: string) => void): void {
    this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
  }
}

export default ChatService;
