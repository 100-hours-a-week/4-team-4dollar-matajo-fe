// src/utils/csvUtils.ts
import Papa from 'papaparse';

export interface DongData {
  original_name: string;
  display_name: string;
  latitude: string;
  longitude: string;
  city_district?: string;
  formatted_address?: string;
  class?: string;
  type?: string;
}

/**
 * CSV 파일에서 동 데이터를 로드
 * @param filePath CSV 파일 경로
 * @returns Promise<DongData[]> 동 데이터 배열
 */
export const loadDongDataFromCSV = async (filePath: string): Promise<DongData[]> => {
  try {
    // 파일 내용 가져오기
    const response = await fetch(filePath);
    const csvContent = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: results => {
          // CSV 파싱 결과에서 데이터 추출
          const data = results.data as DongData[];
          resolve(data);
        },
        error: (error: Error) => {
          console.error('CSV 파싱 오류:', error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('CSV 파일 로드 오류:', error);
    throw error;
  }
};

/**
 * 특정 검색어로 동 데이터 검색
 * @param dongData 검색할 동 데이터 배열
 * @param query 검색어
 * @returns DongData[] 검색 결과
 */
export const searchDongData = (dongData: DongData[], query: string): DongData[] => {
  if (!query || query.trim() === '') {
    return [];
  }

  // SQL LIKE 스타일로 검색 (% 와일드카드처럼)
  const searchTerm = query.toLowerCase();

  return dongData.filter(item => {
    const displayName = item.display_name?.toLowerCase() || '';
    const originalName = item.original_name?.toLowerCase() || '';
    const formattedAddress = item.formatted_address?.toLowerCase() || '';

    // 검색어가 포함된 항목 필터링 (SQL LIKE 쿼리와 유사하게)
    return (
      displayName.includes(searchTerm) ||
      originalName.includes(searchTerm) ||
      formattedAddress.includes(searchTerm)
    );
  });
};

/**
 * 선택한 위치의 좌표 찾기
 * @param dongData 동 데이터 배열
 * @param location 위치 문자열
 * @returns {lat: number, lng: number} | null 좌표 객체 또는 null
 */
export const findDongCoordinates = (
  dongData: DongData[],
  location: string,
): { lat: number; lng: number } | null => {
  // 선택한 위치가 있는 항목 찾기
  const selectedLocation = dongData.find(
    item =>
      item.original_name === location ||
      item.display_name === location ||
      item.formatted_address === location,
  );

  if (selectedLocation && selectedLocation.latitude && selectedLocation.longitude) {
    return {
      lat: parseFloat(selectedLocation.latitude),
      lng: parseFloat(selectedLocation.longitude),
    };
  }

  return null;
};
