import axios, { AxiosResponse } from 'axios';
import client from '../client';
import { API_BACKEND_URL, API_PATHS } from '../../../constants/api';
import { registerKeeperTerms } from './keeper';

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
      const trades: TradeItem[] = response.data.data.map((item: BackendTradeItem) => ({
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

/**
 * 사용자 프로필 정보를 조회하는 함수
 * @returns Promise<UserProfile> 사용자 프로필 정보를 담은 Promise
 */
export interface UserProfile {
  userId: string;
  nickname: string;
  email: string;
  profileImage?: string;
  isKeeper: boolean;
  createdAt: string;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response: AxiosResponse<ApiResponse<UserProfile>> = await client.get(
      API_PATHS.USER.PROFILE,
    );

    if (response.data.success) {
      return response.data.data;
    } else {
      console.error('프로필 조회 실패:', response.data.message);
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('프로필 API 호출 오류:', error);
    throw error;
  }
};

interface KeeperRegistrationData {
  terms_of_service: boolean;
  privacy_policy: boolean;
}

/**
 * 보관인 등록 함수 (keeper.ts의 registerKeeperTerms 함수 사용)
 * @deprecated - keeper.ts의 registerKeeperTerms 함수를 사용하세요.
 */
export const registerAsKeeper = async (termsData: {
  terms_of_service: boolean;
  privacy_policy: boolean;
}) => {
  console.warn(
    'registerAsKeeper 함수는 deprecated 되었습니다. keeper.ts의 registerKeeperTerms 함수를 사용해주세요.',
  );
  return registerKeeperTerms(termsData);
};

export interface PlaceItem {
  post_id: number;
  post_title: string;
  post_address: string;
  post_main_image: string;
  hidden_status: boolean;
  prefer_price: number;
  created_at: string;
}

export const getUserPlaces = async (): Promise<PlaceItem[]> => {
  // 임시 목업 데이터
  const mockData: PlaceItem[] = [
    {
      post_id: 13,
      post_title: '케아네집',
      post_address: '부산 부산진구 신천대로 241',
      post_main_image:
        'https://matajo-image.s3.ap-northeast-2.amazonaws.com/post/2e807462-62eb-44cd-8939-1651734adc15.jpg',
      hidden_status: false,
      prefer_price: 32324,
      created_at: '2025.03.27 13:26:27',
    },
  ];

  return Promise.resolve(mockData);
};
