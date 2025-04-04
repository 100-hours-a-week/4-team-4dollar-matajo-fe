/* eslint-disable no-restricted-globals, no-undef */
// Firebase SDK 임포트
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// 캐시 이름 정의
const CACHE_NAME = 'matajo-cache-v1';

// 전역 Firebase 설정 객체 초기화
let firebaseConfig = {};

// 메시지 리스너 추가
self.addEventListener('message', event => {
  if (event.data.type === 'FIREBASE_CONFIG') {
    firebaseConfig = event.data.config;

    // Firebase 초기화
    firebase.initializeApp(firebaseConfig);

    // Firebase 메시징 인스턴스 가져오기
    const messaging = firebase.messaging();

    // 백그라운드 메시지 핸들러
    messaging.onBackgroundMessage(payload => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);

      const { notification } = payload;
      if (notification) {
        const { title, body, icon, clickAction, image } = notification;

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

        self.registration.showNotification(title, notificationOptions);
      }
    });
  }
});

// 알림 클릭 이벤트 핸들러
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const { clickAction } = event.notification.data || {};

  if (clickAction) {
    // 채팅방 열기
    if (clickAction === 'OPEN_CHAT_ROOM') {
      const roomId = event.notification.data.roomId;
      if (roomId) {
        const chatUrl = `/chat/${roomId}`;

        // 이미 열려있는 윈도우가 있는지 확인 후 포커스
        event.waitUntil(
          clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            // 이미 열려있는 탭인지 확인
            for (let client of windowClients) {
              if (client.url.includes(chatUrl) && 'focus' in client) {
                return client.focus();
              }
            }

            // 새로운 윈도우 열기
            if (clients.openWindow) {
              return clients.openWindow(chatUrl);
            }
          }),
        );
      }
    }
  }
});

// 설치 이벤트 핸들러
self.addEventListener('install', event => {
  self.skipWaiting();
});

// 활성화 이벤트 핸들러
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)),
      );
    }),
  );
});
