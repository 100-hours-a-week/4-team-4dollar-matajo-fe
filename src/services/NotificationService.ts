// src/services/NotificationService.ts
import SockJS from 'sockjs-client';
import { Client, IFrame } from '@stomp/stompjs';
import { API_BACKEND_URL } from '../constants/api';
import { getUserId } from '../utils/formatting/decodeJWT';
import { markAllNotificationsAsRead, NotificationResponseDto } from './api/modules/notification';

class NotificationService {
  private static instance: NotificationService;
  private stompClient: Client | null = null;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private messageCallbacks: ((notification: NotificationResponseDto) => void)[] = [];
  private unreadCountCallbacks: ((count: number) => void)[] = [];
  private connectionCallbacks: (() => void)[] = [];
  private errorCallbacks: ((error: string) => void)[] = [];
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 3000; // 3초

  // 싱글톤 인스턴스 얻기
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
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
      console.log('알림 서비스 연결 시도 중...');

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        this.connectionPromise = null;
        return reject(new Error('인증이 필요합니다.'));
      }

      const userId = getUserId(accessToken);
      if (userId === null) {
        this.connectionPromise = null;
        return reject(new Error('유효하지 않은 토큰입니다.'));
      }

      try {
        // SockJS 옵션 설정
        const sockJSOptions: any = {
          transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
          timeout: 10000,
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        };

        // STOMP 클라이언트 생성
        this.stompClient = new Client({
          webSocketFactory: () =>
            new SockJS(
              `${API_BACKEND_URL}ws-chat?userId=${userId}&token=${accessToken}`,
              null,
              sockJSOptions,
            ),
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          connectHeaders: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },

          debug:
            process.env.NODE_ENV === 'development'
              ? msg => console.log('STOMP Debug:', msg)
              : undefined,

          // 연결 성공 콜백
          onConnect: (frame: IFrame) => {
            console.log('알림 서비스 WebSocket 연결 성공!');
            this.connectionStatus = 'connected';
            this.reconnectAttempts = 0;

            // 사용자별 알림 구독
            this.subscribeToUserNotifications(userId.toString());

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

  // 사용자별 알림 구독
  private subscribeToUserNotifications(userId: string): void {
    if (!this.stompClient?.connected) {
      console.error('STOMP 클라이언트가 연결되어 있지 않습니다.');
      return;
    }

    try {
      // user/{userId}/queue/notifications 형식으로 구독
      this.stompClient.subscribe(`/user/${userId}/queue/notifications`, message => {
        try {
          if (!message.body) {
            console.warn('빈 알림 메시지 수신됨');
            return;
          }

          const notification = JSON.parse(message.body) as NotificationResponseDto;
          console.log('새 알림 수신:', notification);

          // 알림 발송
          this.messageCallbacks.forEach(callback => callback(notification));

          // 읽지 않은 알림 카운트 업데이트
          if (notification.unreadCount !== undefined) {
            this.unreadCountCallbacks.forEach(callback => callback(notification.unreadCount));
          }
        } catch (error) {
          console.error('알림 메시지 처리 에러:', error);
        }
      });

      console.log(`사용자 알림 구독 성공: ${userId}`);
    } catch (error) {
      console.error('알림 구독 에러:', error);
    }
  }

  // 모든 알림 읽음 처리
  public async markAllAsRead(): Promise<boolean> {
    try {
      const success = await markAllNotificationsAsRead();

      if (success) {
        // 읽음 처리 성공 시 카운트 0으로 업데이트
        this.unreadCountCallbacks.forEach(callback => callback(0));
      }

      return success;
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      return false;
    }
  }

  // 알림 메시지 리스너 등록
  public onNotification(callback: (notification: NotificationResponseDto) => void): void {
    this.messageCallbacks.push(callback);
  }

  // 알림 메시지 리스너 제거
  public removeNotificationListener(
    callback: (notification: NotificationResponseDto) => void,
  ): void {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  // 읽지 않은 알림 카운트 리스너 등록
  public onUnreadCountChange(callback: (count: number) => void): void {
    this.unreadCountCallbacks.push(callback);
  }

  // 읽지 않은 알림 카운트 리스너 제거
  public removeUnreadCountListener(callback: (count: number) => void): void {
    this.unreadCountCallbacks = this.unreadCountCallbacks.filter(cb => cb !== callback);
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

  // 연결 리스너 제거
  public removeConnectListener(callback: () => void): void {
    this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
  }

  // 에러 리스너 제거
  public removeErrorListener(callback: (error: string) => void): void {
    this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
  }

  // 연결 해제
  public disconnect(): void {
    if (this.stompClient && this.stompClient.connected) {
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
        `알림 서비스 재연결 예약 ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS} (${delay}ms 후)`,
      );

      this.reconnectTimeout = setTimeout(() => {
        console.log(
          `알림 서비스 재연결 시도 중 (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`,
        );
        this.connect().catch(err => {
          console.error('알림 서비스 재연결 실패:', err);
        });
      }, delay);
    } else {
      console.error(`최대 재연결 시도 횟수 (${this.MAX_RECONNECT_ATTEMPTS})에 도달했습니다`);
      this.errorCallbacks.forEach(callback =>
        callback('연결 시도 횟수 초과. 새로고침 후 다시 시도해주세요.'),
      );
    }
  }

  // 연결 상태 확인
  public isConnected(): boolean {
    return (
      this.connectionStatus === 'connected' &&
      this.stompClient !== null &&
      this.stompClient.connected
    );
  }
}

export default NotificationService;
