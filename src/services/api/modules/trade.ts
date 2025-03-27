import client from '../client';
import { API_PATHS } from '../../../constants/api';
import axios from 'axios';

// 거래 생성 요청 인터페이스
export interface TradeCreateRequest {
  room_id: number;
  product_name: string;
  category: string;
  start_date: string;
  storage_period: number;
  trade_price: number;
}

// 거래 생성 응답 인터페이스
export interface TradeCreateResponse {
  success: boolean;
  message: string;
  data: {
    trade_id: number;
  };
}

// 거래 내역 조회 응답 아이템 인터페이스
export interface TradeListItem {
  tradeId: number;
  keeperStatus: boolean; // true면 보관자, false면 이용자
  productName: string;
  userId: number;
  postAddress: string;
  tradeDate: string;
  startDate: string;
  storagePeriod: number;
  tradePrice: number;
}

// 백엔드 응답 형태의 거래 내역 아이템
interface BackendTradeItem {
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

/**
 * 거래 정보 작성 API 함수
 * @param data 거래 정보
 * @returns 거래 생성 결과
 */
export const createTrade = async (data: TradeCreateRequest): Promise<TradeCreateResponse> => {
  try {
    console.log('거래 정보 작성 요청:', data);
    // API_PATHS.TRADES가 아직 정의되지 않았을 수 있으므로 직접 경로 지정
    const response = await client.post('/api/trades', data);
    console.log('거래 정보 작성 성공:', response.data);

    return response.data;
  } catch (error) {
    console.error('거래 정보 작성 실패:', error);

    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data.message || '거래 정보 작성에 실패했습니다.',
        data: { trade_id: 0 },
      };
    }

    return {
      success: false,
      message: '네트워크 오류가 발생했습니다.',
      data: { trade_id: 0 },
    };
  }
};

/**
 * 내 거래 내역 조회 API 함수
 * @returns 거래 내역 목록
 */
export const getMyTrades = async (): Promise<TradeListItem[]> => {
  try {
    console.log('내 거래 내역 조회 요청');
    const response = await client.get(API_PATHS.MYPAGE.TRADE);
    console.log('내 거래 내역 조회 성공:', response.data);

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data.map((item: BackendTradeItem) => ({
        tradeId: item.trade_id,
        keeperStatus: item.keeper_status,
        productName: item.product_name,
        userId: item.user_id,
        postAddress: item.post_address,
        tradeDate: item.trade_date,
        startDate: item.start_date,
        storagePeriod: item.storage_period,
        tradePrice: item.trade_price,
      }));
    }

    return [];
  } catch (error) {
    console.error('내 거래 내역 조회 실패:', error);
    return [];
  }
};

/**
 * 특정 거래 상세 정보 조회 API 함수
 * @param tradeId 거래 ID
 * @returns 거래 상세 정보
 */
export const getTradeDetail = async (tradeId: number): Promise<TradeListItem | null> => {
  try {
    console.log('거래 상세 정보 조회 요청:', tradeId);
    // 직접 URL 사용
    const response = await client.get(`/api/trades/${tradeId}`);
    console.log('거래 상세 정보 조회 성공:', response.data);

    if (response.data.success && response.data.data) {
      const item = response.data.data;
      return {
        tradeId: item.trade_id,
        keeperStatus: item.keeper_status,
        productName: item.product_name,
        userId: item.user_id,
        postAddress: item.post_address,
        tradeDate: item.trade_date,
        startDate: item.start_date,
        storagePeriod: item.storage_period,
        tradePrice: item.trade_price,
      };
    }

    return null;
  } catch (error) {
    console.error('거래 상세 정보 조회 실패:', error);
    return null;
  }
};

/**
 * 거래 취소 API 함수
 * @param tradeId 거래 ID
 * @returns 취소 결과
 */
export const cancelTrade = async (
  tradeId: number,
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('거래 취소 요청:', tradeId);
    // 직접 URL 사용
    const response = await client.post(`/api/trades/cancel/${tradeId}`);
    console.log('거래 취소 성공:', response.data);

    return {
      success: true,
      message: response.data.message || '거래가 취소되었습니다.',
    };
  } catch (error) {
    console.error('거래 취소 실패:', error);

    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data.message || '거래 취소에 실패했습니다.',
      };
    }

    return {
      success: false,
      message: '네트워크 오류가 발생했습니다.',
    };
  }
};
