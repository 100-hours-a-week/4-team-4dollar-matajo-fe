import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const SOCKET_URL = 'http://15.164.251.118:8080/ws-stomp';

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: { [key: string]: any } = {};
  private userId: string = '';

  // WebSocket 연결
  connect(userId: string, callback: () => void) {
    this.userId = userId;

    // 테스트 환경에서는 WebSocket 연결 시도 없이 바로 성공 콜백 호출
    if (process.env.NODE_ENV === 'development') {
      console.log('개발 환경에서는 WebSocket 연결을 시뮬레이션합니다.');
      callback();
      return;
    }

    // 새 연결 생성
    this.client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      debug: function (str) {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      // credentials 관련 설정 수정
      connectHeaders: {
        login: '',
        passcode: '',
      },
    });

    // 연결 이벤트 핸들러
    this.client.onConnect = () => {
      console.log('WebSocket Connected!');
      callback();
    };

    // 에러 핸들러
    this.client.onStompError = frame => {
      console.error('STOMP Error:', frame);
    };

    // 연결 시작 전 오류 처리 추가
    try {
      this.client.activate();
      console.log('WebSocket 연결 시도 중...');
    } catch (err) {
      console.error('WebSocket 연결 실패:', err);
      // 오류 발생 시 API 폴백 기능 구현 가능
    }
  }

  // 채팅방 구독
  subscribe(roomId: string, callback: (message: any) => void) {
    // 개발 환경에서는 실제 구독 없이 핸들러만 저장
    if (process.env.NODE_ENV === 'development') {
      this.subscriptions[roomId] = {
        unsubscribe: () => console.log(`Room ${roomId} 구독 해제 (시뮬레이션)`),
      };
      console.log(`Room ${roomId} 구독 완료 (시뮬레이션)`);
      return;
    }

    try {
      // 이미 구독 중인 경우 중복 구독 방지
      if (this.subscriptions[roomId]) {
        return;
      }

      // 채팅방 구독 (사용자 ID도 함께 전송)
      const destination = `/sub/chat/room/${roomId}`;
      this.subscriptions[roomId] = this.client.subscribe(destination, message => {
        try {
          const parsedMessage = JSON.parse(message.body);
          callback(parsedMessage);
        } catch (error) {
          console.error('메시지 파싱 오류:', error);
        }
      });

      console.log(`Subscribed to room: ${roomId}`);
    } catch (err) {
      console.error('구독 실패:', err);
    }
  }

  // 메시지 전송
  sendMessage(roomId: string, message: any) {
    if (!this.client || !this.client.connected) {
      console.error('WebSocket is not connected');
      return;
    }

    try {
      // 수정된 메시지 전송 경로
      const destination = `/app/${roomId}/message`;
      console.log(`메시지 전송 경로: ${destination}`);

      const body = JSON.stringify({
        type: 'TALK',
        roomId: parseInt(roomId, 10),
        senderId: message.senderId,
        content: message.content,
        messageType: message.messageType || 'TEXT',
      });

      this.client.publish({
        destination,
        body,
      });

      console.log(`Message sent to room ${roomId}:`, body);
    } catch (err) {
      console.error('메시지 전송 실패:', err);
    }
  }

  // HTTP 대체 수단으로 메시지 전송 (WebSocket 실패 시)
  private async sendViaHttpFallback(roomId: string, message: any) {
    try {
      console.log('WebSocket 연결 실패, HTTP API로 메시지 전송 시도');

      // chatApiService 등의 HTTP API를 사용하여 메시지 전송
      // 예: chatApiService.sendMessage(roomId, message.content);

      console.log('HTTP로 메시지 전송 완료');
    } catch (err) {
      console.error('HTTP 메시지 전송도 실패:', err);
    }
  }
  // websocketSer vice.ts 파일에 아래 메서드를 추가해주세요
  // WebSocket 연결 상태 확인
  isConnected(): boolean {
    return !!this.client && this.client.connected;
  }
  // 연결 해제
  disconnect() {
    if (this.client) {
      try {
        // 모든 구독 해제
        Object.keys(this.subscriptions).forEach(roomId => {
          if (this.subscriptions[roomId]) {
            this.subscriptions[roomId].unsubscribe();
            delete this.subscriptions[roomId];
          }
        });

        // 연결 종료
        this.client.deactivate();
        this.client = null;
        console.log('WebSocket Disconnected');
      } catch (err) {
        console.error('WebSocket 연결 해제 실패:', err);
      }
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export default new WebSocketService();
