// src/utils/csvUtils.ts
import Papa from 'papaparse';

// 동(Dong) 데이터 인터페이스 정의
export interface DongData {
  original_name: string;
  formatted_address: string; // 추가된 필드
  latitude: string;
  longitude: string;
  display_name: string;
  class?: string;
  type?: string;
}

/**
 * CSV 파일에서 동 데이터를 로드하는 함수
 * @param filePath CSV 파일 경로
 * @returns 프로미스로 반환되는 동 데이터 배열
 */
export const loadDongDataFromCSV = (filePath: string): Promise<DongData[]> => {
  return new Promise((resolve, reject) => {
    // HTTP 요청으로 CSV 파일 가져오기
    fetch(filePath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(csvText => {
        // PapaParse로 CSV 파싱
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: results => {
            // 데이터 로드 및 형식화
            const dongData = results.data as DongData[];
            resolve(dongData);
          },
          error: error => {
            reject(error.message);
          },
        });
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * 동 데이터를 검색하는 함수
 * @param dongData 동 데이터 배열
 * @param searchTerm 검색어
 * @returns 검색 결과 동 데이터 배열
 */
export const searchDongData = (dongData: DongData[], searchTerm: string): DongData[] => {
  if (!searchTerm.trim()) return [];

  // 검색어를 소문자로 변환
  const term = searchTerm.toLowerCase();

  // 동 데이터 필터링
  return dongData.filter(item => {
    const originalName = item.original_name.toLowerCase();
    const displayName = item.display_name.toLowerCase();
    const formattedAddress = item.formatted_address.toLowerCase();

    return (
      originalName.includes(term) || displayName.includes(term) || formattedAddress.includes(term)
    );
  });
};

/**
 * 선택한 위치(동)의 좌표를 찾는 함수
 * @param dongData 동 데이터 배열
 * @param locationName 위치명(동 이름)
 * @returns 위도, 경도 객체 또는 undefined
 */
export const findDongCoordinates = (
  dongData: DongData[],
  locationName: string,
): { lat: number; lng: number } | undefined => {
  // 위치명과 일치하는 동 데이터 찾기 (formatted_address 사용)
  const matchedDong = dongData.find(
    item => item.formatted_address === locationName || item.original_name === locationName,
  );

  if (matchedDong && matchedDong.latitude && matchedDong.longitude) {
    return {
      lat: parseFloat(matchedDong.latitude),
      lng: parseFloat(matchedDong.longitude),
    };
  }

  return undefined;
};
