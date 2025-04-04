/* eslint-disable no-restricted-globals, no-undef */

// Firebase SDK 불러오기 (Compat 버전)
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase 초기화 상태 플래그
self.firebaseInitialized = false;

// Firebase 설정 메시지를 수신하면 초기화 + 백그라운드 메시지 핸들러 등록
self.addEventListener('message', event => {
  if (event.data?.type === 'FIREBASE_CONFIG') {
    if (!self.firebaseInitialized) {
      self.firebaseInitialized = true;

      firebase.initializeApp(event.data.config);
      console.log('🔥 Firebase initialized in service worker');

      const messaging = firebase.messaging();

      // ✅ Firebase FCM 백그라운드 메시지 처리
      messaging.onBackgroundMessage(payload => {
        console.log('[sw.js] 💬 Background FCM message:', payload);

        const { title, body, icon, clickAction, image } = payload.notification || {};

        const notificationOptions = {
          body,
          icon: icon || '/favicon.ico',
          badge: '/favicon.ico',
          image: image || undefined,
          data: {
            clickAction,
            ...payload.data,
          },
        };

        self.registration.showNotification(title || '알림', notificationOptions);
      });
    }
  }
});

// ✅ DevTools에서 직접 Push 버튼으로 테스트할 수 있도록 push 이벤트 핸들러 추가
self.addEventListener('push', event => {
  console.log('📨 [Push Event from DevTools] Received:', event);

  const data = event.data?.json?.() || {};
  const title = data.notification?.title || 'DevTools 테스트 알림';
  const body = data.notification?.body || 'DevTools에서 푸시 이벤트가 발생했습니다.';

  const options = {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ✅ 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const { clickAction, roomId } = event.notification.data || {};
  let targetUrl = '/';

  if (clickAction === 'OPEN_CHAT_ROOM' && roomId) {
    targetUrl = `/chat/${roomId}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }),
  );
});

// ✅ 설치 이벤트
self.addEventListener('install', event => {
  console.log('📦 Service Worker installing...');
  self.skipWaiting(); // 즉시 활성화
});

// ✅ 활성화 이벤트
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activated!');
  self.clients.claim(); // 클라이언트 바로 제어
});
