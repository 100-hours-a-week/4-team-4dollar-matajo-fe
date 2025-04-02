import client from '../client';
import { API_PATHS } from '../../../constants/api';

// 거래 생성 요청 인터페이스
export interface CreateTradeRequest {
  room_id: number; // 채팅방 ID
  product_name: string; // 상품명
  category: string; // 카테고리
  start_date: string; // 시작 일자 (YYYY-MM-DD)
  storage_period: number; // 보관 기간
  trade_price: number; // 거래 가격
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

// 거래 아이템 인터페이스
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

// 내 거래 내역 응답 인터페이스
export interface MyTradesResponse {
  success: boolean;
  message: string;
  data: TradeItem[];
}

// 최근 거래 내역 인터페이스
export interface RecentTrade {
  category: string;
  main_image: string;
  product_name: string;
  storage_period: number;
  trade_date: string;
  trade_price: number;
}

export interface RecentTradesResponse {
  success: boolean;
  message: string;
  data: RecentTrade[];
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
 * 내 거래 내역 조회 API
 * @returns 거래 내역 목록
 */
export const getMyTrades = async (): Promise<TradeItem[]> => {
  try {
    const response = await client.get<MyTradesResponse>(API_PATHS.TRADES.MY_TRADES);

    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      console.log('거래 내역 조회 성공:', response.data);
      return response.data.data;
    }

    console.warn('거래 내역 응답 형식 오류:', response.data);
    return [];
  } catch (error: any) {
    console.error('거래 내역 조회 실패:', error);

    if (error.response?.status === 401) {
      // 토큰이 만료되었거나 유효하지 않은 경우
      localStorage.removeItem('accessToken');
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    } else if (error.response?.status === 500) {
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else if (error.response?.status === 404) {
      throw new Error('요청한 API를 찾을 수 없습니다.');
    } else if (!error.response) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
    }

    throw new Error('거래 내역을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
};

/**
 * 최근 거래 내역 조회 API
 * @param locationInfoId 위치 정보 ID
 * @returns 최근 거래 내역 목록
 */
export const getRecentTrades = async (locationInfoId: number): Promise<RecentTradesResponse> => {
  try {
    console.log('getRecentTrades 호출 - locationInfoId:', locationInfoId);
    const response = await client.get(API_PATHS.TRADES.RECENT_BY_LOCATION, {
      params: { locationInfoId },
    });
    console.log('API 응답 데이터:', response.data);
    return response.data;
  } catch (error) {
    console.error('최근 거래 내역 조회 실패:', error);
    throw error;
  }
};
