import axios from 'axios';
import { LocationIdData } from '../../types/location';

export const getLocationId = async (address: string): Promise<LocationIdData[]> => {
  try {
    const response = await axios.get(`/api/v1/location/search?query=${address}`);
    return response.data;
  } catch (error) {
    console.error('위치 검색 실패:', error);
    return [];
  }
};
