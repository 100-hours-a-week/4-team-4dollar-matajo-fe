import { AxiosResponse } from 'axios';
import client from './client';
import { API_PATHS } from '../constants/api';

// 거래 내역 데이터 인터페이스
export interface TradeItem {
  tradeId: number;
  keeperStatus: boolean;
  productName: string;
  userId: number;
  postAddress: string;
  tradeDate: string;
  startDate: string;
  storagePeriod: number;
  tradePrice: number;
}

// 백엔드 API 응답 타입 정의
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// 백엔드 거래 내역 응답 타입 정의
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
 * 사용자 거래 내역을 조회하는 함수
 * @returns Promise<TradeItem[]> 거래 내역 배열을 담은 Promise
 */
export const getMyTrades = async (): Promise<TradeItem[]> => {
  try {
    const response: AxiosResponse<ApiResponse<BackendTradeItem[]>> = await client.get(
      API_PATHS.MYPAGE.TRADE,
    );

    if (response.data.success) {
      // 백엔드 응답 데이터를 프론트엔드 형식으로 변환
      const trades: TradeItem[] = response.data.data.map(item => ({
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

      return trades;
    } else {
      console.error('거래 내역 조회 실패:', response.data.message);
      return [];
    }
  } catch (error) {
    console.error('거래 내역 API 호출 오류:', error);
    throw error;
  }
};
