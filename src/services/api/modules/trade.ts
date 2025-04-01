import { API_PATHS } from '../../../constants/api';
import axios from 'axios';
import client from '../client';

export interface Trade {
  mainImage: string;
  productName: string;
  category: string;
  tradeDate: string;
  tradePrice: number;
  storagePeriod: number;
}

export interface TradeResponse {
  success: boolean;
  message: string;
  data: Trade[];
}

export const getRecentTrades = async (locationInfoId: number): Promise<TradeResponse> => {
  const response = await client.get(`${API_PATHS.TRADES.RECENT_BY_LOCATION}`, {
    params: { locationInfoId },
  });
  return response.data;
};
