import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getMessaging,
  Messaging,
  getToken,
  onMessage,
  deleteToken,
  MessagePayload as FirebaseMessagePayload,
} from 'firebase/messaging';
import client from './api/client';
import { API_PATHS } from '../constants/api';

// 메시지 페이로드 타입 정의
interface MessagePayload {
  notification?: {
    title: string;
    body: string;
  };
  data?: Record<string, string>;
}

// renotify, data 등 추가 옵션을 허용하기 위한 CustomNotificationOptions
interface CustomNotificationOptions extends NotificationOptions {
  renotify?: boolean;
  // data 필드가 any여야 브라우저 내부나 Safari 호환성 문제를 줄일 수 있음
  data?: unknown;
}

// Firebase 설정값
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

class FcmService {
  private static instance: FcmService | null = null;
  private app: FirebaseApp | null = null;
  private messaging: Messaging | null = null;
  private currentToken: string | null = null;
  private initialized = false;
  private vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY || '';

  private messageCallbacks: Array<(payload: MessagePayload) => void> = [];
  private tokenChangeCallbacks: Array<(token: string) => void> = [];

  public static getInstance(): FcmService {
    if (!FcmService.instance) {
      FcmService.instance = new FcmService();
    }
    return FcmService.instance;
  }

  private constructor() {
    // 자동 초기화 시도 (단, Safari에서 Notification.requestPermission()은 "사용자 제스처" 필요)
    if (!this.isSupported()) {
      console.warn('Browser does not support FCM');
      return;
    }

    try {
      this.app = initializeApp(firebaseConfig);
      this.messaging = getMessaging(this.app);
      this.initialized = true;
      console.log('Firebase Messaging initialized');

      // 로컬 스토리지에서 기존 토큰 복원
      this.currentToken = localStorage.getItem('fcmToken');

      // 메시지 리스너 설정
      this.setupMessageListener();
    } catch (error) {
      console.error('Firebase initialization failed:', error);
    }
  }

  /**
   * Safari 등 일부 브라우저에서는 권한 요청이 사용자 클릭 이벤트 등에서만 가능
   * → 실제 버튼 onClick 등에서 이 메서드를 호출하도록 권장
   */
  public async requestPermissionByUserGesture(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * 기존에 자동으로 requestPermission()을 호출했던 부분 제거
   * → 브라우저 사용자가 명시적으로 동의 버튼을 눌렀을 때 "requestPermissionByUserGesture"를 먼저 호출해야 함
   * → 그 후 getAndRegisterToken()을 호출하면 안전
   */
  public async getAndRegisterToken(): Promise<string | null> {
    if (!this.initialized || !this.messaging) return null;

    // check permission but do not forcibly request
    if (Notification.permission !== 'granted') {
      console.warn(
        'Notification permission not granted yet. Call requestPermissionByUserGesture first.',
      );
      return null;
    }

    try {
      const token = await getToken(this.messaging, { vapidKey: this.vapidKey });
      if (!token) {
        console.warn('No FCM token available');
        return null;
      }

      if (this.currentToken !== token) {
        const oldToken = this.currentToken;
        this.currentToken = token;

        const success = oldToken
          ? await this.refreshToken(oldToken, token)
          : await this.registerTokenWithServer(token);

        if (success) {
          localStorage.setItem('fcmToken', token);
          this.notifyTokenChange(token);
          console.log('FCM Token stored and server updated');
        }
      }

      return token;
    } catch (error) {
      console.error('Failed to get and register token:', error);
      return null;
    }
  }

  /**
   * 서버에 최초 토큰 등록
   */
  private async registerTokenWithServer(token: string): Promise<boolean> {
    try {
      const res = await client.post(API_PATHS.FCM.REGISTER_TOKEN, { token });
      return res.data.success === true;
    } catch (error) {
      console.error('registerTokenWithServer error:', error);
      return false;
    }
  }

  /**
   * 서버에 토큰 갱신( old_token → new_token )
   * 400 에러 시 기존 토큰이 서버에 없다고 판단, deleteToken()으로 로컬도 제거
   */
  public async refreshToken(oldToken: string, newToken: string): Promise<boolean> {
    try {
      const res = await client.post(API_PATHS.FCM.REFRESH_TOKEN, {
        old_token: oldToken,
        new_token: newToken,
      });
      return res.data.success === true;
    } catch (error: any) {
      console.error('refreshToken error:', error);

      if (error.response?.status === 400) {
        console.warn('Token refresh failed (400). Clearing local token');
        await this.deleteToken();
        return false;
      }
      return false;
    }
  }

  /**
   * 서버 & 로컬 스토리지에서 토큰 삭제
   */
  public async deleteToken(): Promise<boolean> {
    if (!this.initialized || !this.messaging) return false;

    try {
      await deleteToken(this.messaging);
      await client.delete(API_PATHS.FCM.DELETE_TOKEN);
      localStorage.removeItem('fcmToken');
      this.currentToken = null;
      console.log('FCM 토큰 삭제 완료');
      return true;
    } catch (error) {
      console.error('deleteToken error:', error);
      return false;
    }
  }

  /**
   * FCM 포그라운드 메시지(브라우저 탭 활성 상태에서 수신되는 메시지) 핸들러 설정
   */
  private setupMessageListener(): void {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload: FirebaseMessagePayload) => {
      const message: MessagePayload = {
        notification: payload.notification
          ? {
              title: payload.notification.title || '',
              body: payload.notification.body || '',
            }
          : undefined,
        data: payload.data,
      };

      this.showNotification(message);
      this.messageCallbacks.forEach(cb => cb(message));
    });
  }

  /**
   * 알림 표시 (사용자 설정에 따라)
   * Safari 등에서는 알림 권한을 자동 요청하면 에러
   */
  private showNotification(payload: MessagePayload): void {
    if (!payload.notification || Notification.permission !== 'granted') return;

    const { title = '알림', body } = payload.notification;
    const { data } = payload;

    // 커스텀 타입으로 renotify 허용
    const options: CustomNotificationOptions = {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data?.roomId || 'general',
      renotify: true,
      data,
    };

    const notif = new Notification(title, options);

    notif.onclick = () => {
      if (typeof data?.roomId === 'string') {
        window.location.href = `/chat/${data.roomId}`;
        window.focus();
      }
    };
  }

  /**
   * 포그라운드 메시지 콜백 등록
   */
  public onMessage(callback: (payload: MessagePayload) => void): void {
    this.messageCallbacks.push(callback);
  }

  public offMessage(callback: (payload: MessagePayload) => void): void {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  /**
   * 토큰 변경 시 호출될 콜백 등록
   */
  public onTokenChange(callback: (token: string) => void): void {
    this.tokenChangeCallbacks.push(callback);
    if (this.currentToken) {
      callback(this.currentToken);
    }
  }

  public offTokenChange(callback: (token: string) => void): void {
    this.tokenChangeCallbacks = this.tokenChangeCallbacks.filter(cb => cb !== callback);
  }

  private notifyTokenChange(token: string): void {
    this.tokenChangeCallbacks.forEach(cb => cb(token));
  }

  /**
   * 토큰 주기적 확인 (디폴트 6시간 간격)
   * requestPermission()은 호출하지 않고, 권한이 granted 상태면 getToken()
   */
  public setupTokenRefresh(): void {
    if (!this.messaging) return;

    this.checkAndUpdateToken();
    setInterval(() => this.checkAndUpdateToken(), 6 * 60 * 60 * 1000);
  }

  private async checkAndUpdateToken(): Promise<void> {
    if (!this.messaging) return;

    try {
      if (Notification.permission !== 'granted') {
        console.warn('Notification permission not granted, skip checkAndUpdateToken');
        return;
      }

      const storedToken = localStorage.getItem('fcmToken');
      const freshToken = await getToken(this.messaging, { vapidKey: this.vapidKey });

      if (freshToken && freshToken !== storedToken) {
        const success = storedToken
          ? await this.refreshToken(storedToken, freshToken)
          : await this.registerTokenWithServer(freshToken);

        if (success) {
          localStorage.setItem('fcmToken', freshToken);
          this.currentToken = freshToken;
          this.notifyTokenChange(freshToken);
        }
      }
    } catch (error) {
      console.error('checkAndUpdateToken error:', error);
    }
  }

  private isSupported(): boolean {
    return 'serviceWorker' in navigator && 'Notification' in window && 'PushManager' in window;
  }

  public getCurrentToken(): string | null {
    return this.currentToken;
  }
}

export default FcmService;
