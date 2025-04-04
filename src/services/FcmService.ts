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
type MessagePayload = {
  notification?: {
    title: string;
    body: string;
  };
  data?: {
    [key: string]: string;
  };
};

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
  private static instance: FcmService;
  private app: FirebaseApp | null = null;
  private messaging: Messaging | null = null;
  private initialized = false;
  private messageCallbacks: ((payload: MessagePayload) => void)[] = [];
  private vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY || '';

  // 싱글톤 인스턴스 얻기
  public static getInstance(): FcmService {
    if (!FcmService.instance) {
      FcmService.instance = new FcmService();
    }
    return FcmService.instance;
  }

  private constructor() {
    if (this.isSupported()) {
      try {
        this.app = initializeApp(firebaseConfig);
        this.messaging = getMessaging(this.app);
        this.initialized = true;
        console.log('Firebase Messaging initialized successfully');

        // 포그라운드 메시지 핸들러 등록
        this.setupMessageListener();
      } catch (error) {
        console.error('Firebase initialization error:', error);
      }
    } else {
      console.warn('Firebase Messaging is not supported in this browser');
    }
  }

  // FCM이 브라우저에서 지원되는지 확인
  private isSupported(): boolean {
    return 'serviceWorker' in navigator && 'Notification' in window && 'PushManager' in window;
  }

  // 알림 권한 요청
  public async requestPermission(): Promise<boolean> {
    if (!this.initialized) {
      console.warn('Firebase Messaging not initialized');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  // FCM 토큰 가져오기 및 서버에 등록
  public async getAndRegisterToken(): Promise<string | null> {
    if (!this.initialized || !this.messaging) {
      console.warn('Firebase Messaging not initialized');
      return null;
    }

    try {
      // 알림 권한 확인
      const permission = await this.requestPermission();
      if (!permission) {
        console.warn('Notification permission not granted');
        return null;
      }

      // FCM 토큰 가져오기
      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey,
      });

      if (token) {
        console.log('FCM Token:', token);

        // 서버에 토큰 등록
        await this.registerTokenWithServer(token);

        // 로컬 스토리지에 저장
        localStorage.setItem('fcmToken', token);

        return token;
      } else {
        console.warn('No FCM token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // 서버에 FCM 토큰 등록
  private async registerTokenWithServer(token: string): Promise<boolean> {
    try {
      const response = await client.post(API_PATHS.FCM.REGISTER_TOKEN, { token });
      return response.data.success === true;
    } catch (error) {
      console.error('Error registering FCM token with server:', error);
      return false;
    }
  }

  public async refreshToken(oldToken: string, newToken: string): Promise<boolean> {
    try {
      const response = await client.post(API_PATHS.FCM.REFRESH_TOKEN, {
        oldToken, // 서버가 기대하는 oldToken 필드 추가
        newToken,
      });

      // 로컬 스토리지 업데이트
      localStorage.setItem('fcmToken', newToken);
      return response.data.success === true;
    } catch (error) {
      console.error('Error refreshing FCM token:', error);
      return false;
    }
  }

  // 토큰 삭제
  public async deleteToken(): Promise<boolean> {
    if (!this.initialized || !this.messaging) {
      console.warn('Firebase Messaging not initialized');
      return false;
    }

    try {
      // Firebase에서 토큰 삭제
      await deleteToken(this.messaging);

      // 서버에서 토큰 삭제
      const response = await client.delete(API_PATHS.FCM.DELETE_TOKEN);

      // 로컬 스토리지에서 제거
      localStorage.removeItem('fcmToken');

      return response.data.success === true;
    } catch (error) {
      console.error('Error deleting FCM token:', error);
      return false;
    }
  }

  // 포그라운드 메시지 리스너 설정
  private setupMessageListener(): void {
    if (!this.initialized || !this.messaging) return;

    onMessage(this.messaging, (payload: FirebaseMessagePayload) => {
      // Firebase의 MessagePayload를 우리의 MessagePayload로 변환
      const customPayload: MessagePayload = {
        notification: payload.notification
          ? {
              title: payload.notification.title || '',
              body: payload.notification.body || '',
            }
          : undefined,
        data: payload.data,
      };

      console.log('Foreground message received:', customPayload);

      // 토스트 알림 표시
      this.showNotification(customPayload);

      // 등록된 콜백 실행
      this.messageCallbacks.forEach(callback => callback(customPayload));
    });
  }

  // 포그라운드 메시지 핸들러 등록
  public onMessage(callback: (payload: MessagePayload) => void): void {
    this.messageCallbacks.push(callback);
  }

  // 포그라운드 메시지 핸들러 제거
  public offMessage(callback: (payload: MessagePayload) => void): void {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  // 토스트 알림 표시
  private showNotification(payload: MessagePayload): void {
    const { notification } = payload;

    if (notification) {
      // 브라우저 알림 표시
      if ('Notification' in window && Notification.permission === 'granted') {
        const { title = '알림', body = '' } = notification;

        new Notification(title, {
          body,
          icon: '/favicon.ico', // 적절한 아이콘 경로로 교체
        });
      }

      // 또는 커스텀 토스트 알림 사용
      // 여기에 토스트 라이브러리 활용 코드 추가
    }
  }

  // 토큰 변경 이벤트 리스너 설정
  public setupTokenRefresh(): void {
    if (!this.initialized || !this.messaging) return;

    // Firebase의 토큰 갱신 이벤트가 별도로 없어서,
    // 주기적으로 토큰을 확인하는 방식으로 구현

    // 앱 시작 시 현재 토큰 확인
    this.checkAndUpdateToken();

    // 주기적으로 토큰 확인 (6시간마다)
    setInterval(() => this.checkAndUpdateToken(), 6 * 60 * 60 * 1000);
  }

  // 토큰 확인 및 업데이트
  private async checkAndUpdateToken(): Promise<void> {
    if (!this.initialized || !this.messaging) return;

    try {
      const currentToken = localStorage.getItem('fcmToken');
      if (!currentToken) return;

      // 새 토큰 가져오기
      const freshToken = await getToken(this.messaging, {
        vapidKey: this.vapidKey,
      });

      // 토큰이 변경된 경우 서버에 알림
      if (freshToken && freshToken !== currentToken) {
        console.log('FCM token refreshed');
        await this.refreshToken(currentToken, freshToken);
      }
    } catch (error) {
      console.error('Error checking token:', error);
    }
  }
}

export default FcmService;
