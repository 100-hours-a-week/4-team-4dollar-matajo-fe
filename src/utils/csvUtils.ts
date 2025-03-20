// src/utils/csvUtils.ts

import Papa from 'papaparse';

// 동 데이터 인터페이스
export interface DongData {
  original_name: string;
  display_name: string;
  latitude: string;
  longitude: string;
}

// CSV 파일에서 동 데이터 로드
export const loadDongDataFromCSV = async (filePath: string): Promise<DongData[]> => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();

    return new Promise<DongData[]>((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<any>) => {
          // 데이터 변환 및 필터링
          const dongData = results.data.map((row: any) => ({
            original_name: row.original_name || '',
            display_name: row.display_name || '',
            latitude: row.latitude || '',
            longitude: row.longitude || '',
          }));

          resolve(dongData as DongData[]);
        },
        error: (error: Error) => {
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Error loading CSV file:', error);
    // 오류 발생 시 빈 배열 반환
    return [];
  }
};

// 동 데이터에서 검색어를 포함하는 결과 반환
export const searchDongData = (data: DongData[], searchTerm: string): DongData[] => {
  const term = searchTerm.toLowerCase().trim();

  return data.filter(
    item =>
      item.original_name.toLowerCase().includes(term) ||
      item.display_name.toLowerCase().includes(term),
  );
};

// 선택한 동의 좌표 찾기
export const findDongCoordinates = (
  data: DongData[],
  location: string,
): { lat: number; lng: number } | null => {
  const dongData = data.find(item => item.original_name === location);

  if (dongData && dongData.latitude && dongData.longitude) {
    return {
      lat: parseFloat(dongData.latitude),
      lng: parseFloat(dongData.longitude),
    };
  }

  return null;
};
