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
      console.log('[FCM] 포그라운드 메시지 수신:', payload);

      // 메시지가 수신되면 모바일에서 확인할 수 있도록 콘솔에 자세히 기록
      if (payload.notification) {
        console.log('[FCM] 알림 제목:', payload.notification.title);
        console.log('[FCM] 알림 내용:', payload.notification.body);
      }

      if (payload.data) {
        console.log('[FCM] 데이터:', payload.data);
      }

      const message: MessagePayload = {
        notification: payload.notification
          ? {
              title: payload.notification.title || '',
              body: payload.notification.body || '',
            }
          : undefined,
        data: payload.data,
      };

      this.notifyMessageCallbacks(message);
    });
  }

  /**
   * 등록된 모든 메시지 콜백에 알림
   */
  private notifyMessageCallbacks(message: MessagePayload): void {
    // 콜백이 비어있으면 콘솔에 기록 (디버깅용)
    if (this.messageCallbacks.length === 0) {
      console.warn('[FCM] 등록된 메시지 콜백이 없습니다');
    }

    // 각 콜백을 try-catch로 감싸서 실행 (한 콜백의 오류가 다른 콜백 실행을 방해하지 않도록)
    this.messageCallbacks.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('[FCM] 메시지 콜백 실행 중 오류:', error);
      }
    });

    // DOM 이벤트로도 발생시켜 다른 컴포넌트에서 사용 가능하게
    try {
      const event = new CustomEvent('fcm-message', {
        detail: message,
        bubbles: true,
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('[FCM] 커스텀 이벤트 발생 중 오류:', error);
    }
  }

  /**
   * 포그라운드 메시지 콜백 등록 - 안정성 개선
   */
  public onMessage(callback: (payload: MessagePayload) => void): () => void {
    // 이미 등록된 콜백인지 확인하여 중복 방지
    const existingCallback = this.messageCallbacks.find(cb => cb === callback);
    if (!existingCallback) {
      this.messageCallbacks.push(callback);
    }

    // 콜백 제거 함수 반환 (React useEffect cleanup에 유용)
    return () => this.offMessage(callback);
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

  /**
   * 백그라운드에서 앱으로 돌아왔을 때 Firebase 초기화 확인
   */
  public checkInitialization(): void {
    if (document.visibilityState === 'visible' && !this.initialized && this.isSupported()) {
      console.log('[FCM] 앱이 포그라운드로 돌아와 초기화 확인 중');
      try {
        this.app = initializeApp(firebaseConfig);
        this.messaging = getMessaging(this.app);
        this.initialized = true;
        this.setupMessageListener();
        console.log('[FCM] 앱 복귀 후 재초기화 완료');
      } catch (error) {
        console.error('[FCM] 앱 복귀 후 재초기화 실패:', error);
      }
    }
  }

  /**
   * 앱 표시 상태 변경 이벤트 리스너 설정
   */
  public setupVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      this.checkInitialization();
    });
  }

  private isSupported(): boolean {
    return 'serviceWorker' in navigator && 'Notification' in window && 'PushManager' in window;
  }

  public getCurrentToken(): string | null {
    return this.currentToken;
  }
}

export default FcmService;
