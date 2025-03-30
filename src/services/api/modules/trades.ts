import client from '../client';
import { API_PATHS } from '../../../constants/api';

// 거래 생성 요청 인터페이스
export interface CreateTradeRequest {
  product_name: string; // 상품명
  storage_category: string; // 보관 카테고리
  start_date: string; // 시작 일자 (YYYY-MM-DD)
  end_date: string; // 종료 일자 (YYYY-MM-DD)
  trade_price: number; // 거래 가격
  message?: string; // 추가 메시지 (선택 사항)
  chatroom_id: number; // 채팅방 ID
}

// 거래 생성 응답 인터페이스
export interface CreateTradeResponse {
  success: boolean;
  message: string;
  data?: {
    trade_id: number;
    created_at: string;
  };
}

/**
 * 거래 정보 생성 API
 * @param data 거래 생성 요청 데이터
 * @returns 거래 생성 응답
 */
export const createTrade = async (data: CreateTradeRequest): Promise<CreateTradeResponse> => {
  try {
    const response = await client.post(API_PATHS.CHAT.TRADE_INFO, data);
    return response.data;
  } catch (error) {
    console.error('거래 생성 실패:', error);

    // 에러 응답 구조화
    return {
      success: false,
      message: '거래 정보 생성 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 내 거래 내역 조회 API 인터페이스
 */
export interface TradeItem {
  trade_id: number;
  keeper_status: boolean;
  product_name: string;
  user_id: number;
  post_address: string;
  trade_date: string;
  start_date: string;
  storage_period: number;
  trade_price: number;
}

export interface MyTradesResponse {
  success: boolean;
  message: string;
  data: TradeItem[];
}

/**
 * 내 거래 내역 조회 API
 * @returns 거래 내역 목록
 */
export const getMyTrades = async (): Promise<TradeItem[]> => {
  try {
    // 올바른 API 경로 사용 (API_PATHS.TRADES.MY_TRADES)
    const response = await client.get<MyTradesResponse>(API_PATHS.TRADES.MY_TRADES);

    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      console.log('거래 내역 조회 성공:', response.data);
      return response.data.data;
    }

    console.warn('거래 내역 응답 형식 오류:', response.data);
    return [];
  } catch (error) {
    console.error('거래 내역 조회 실패:', error);
    throw error;
  }
};
