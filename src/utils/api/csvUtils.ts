// src/utils/api/csvUtils.ts
import Papa from 'papaparse';

// 동 데이터 인터페이스 - CSV 파일의 실제 컬럼명과 일치하도록 수정
export interface DongData {
  original_name: string;
  formatted_address: string;
  latitude: string;
  longitude: string;
  display_name: string;
  class?: string;
  type?: string;
  city_district?: string;
}

// CSV 파일에서 동 데이터 로드 함수
export const loadDongDataFromCSV = async (filePath: string): Promise<DongData[]> => {
  try {
    // 파일 경로가 '/'로 시작하지 않으면 추가
    const path = filePath.startsWith('/') ? filePath : `/${filePath}`;

    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`CSV 파일 로드 실패: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // 문자열로 처리
        complete: results => {
          if (results.errors.length > 0) {
            console.error('CSV 파싱 오류:', results.errors);
            reject(new Error('CSV 파싱 중 오류가 발생했습니다.'));
            return;
          }

          // 결과 데이터 매핑 및 검증
          const dongData: DongData[] = results.data
            .filter((row: any) => row.original_name && row.latitude && row.longitude)
            .map((row: any) => ({
              original_name: row.original_name?.trim() || '',
              formatted_address: row.formatted_address?.trim() || '',
              latitude: row.latitude?.trim() || '',
              longitude: row.longitude?.trim() || '',
              display_name: row.display_name?.trim() || '',
              class: row.class?.trim() || '',
              type: row.type?.trim() || '',
              city_district: row.city_district?.trim() || '',
            }));

          console.log(`동 데이터 ${dongData.length}개 로드 완료`);
          resolve(dongData);
        },
        error: (error: Error) => {
          console.error('CSV 파싱 오류:', error);
          reject(error);
        },
      });
    });
  } catch (error: unknown) {
    console.error('동 데이터 로드 오류:', error);
    throw error;
  }
};

// 검색어로 동 데이터 검색 함수
export const searchDongData = (dongData: DongData[], searchText: string): DongData[] => {
  if (!searchText.trim()) {
    return [];
  }

  const searchTermLower = searchText.toLowerCase();

  return dongData.filter(item => {
    // display_name에서 검색 (SQL LIKE 방식)
    const displayNameMatch = item.display_name.toLowerCase().includes(searchTermLower);

    // original_name에서 검색 (백업 검색)
    const originalNameMatch = item.original_name.toLowerCase().includes(searchTermLower);

    // formatted_address에서 검색 (추가 검색)
    const formattedAddressMatch = item.formatted_address.toLowerCase().includes(searchTermLower);

    return displayNameMatch || originalNameMatch || formattedAddressMatch;
  });
};

// 동 이름으로 좌표 찾기
export const findDongCoordinates = (
  dongData: DongData[],
  location: string,
): { lat: number; lng: number } | null => {
  // 위치 이름에서 동 이름 추출
  const parts = location.split(' ');
  const dongName = parts[parts.length - 1]; // 마지막 부분을 동 이름으로 간주

  // 전체 위치 이름으로 정확히 일치하는 항목 찾기
  const exactMatch = dongData.find(
    item => item.original_name === location || item.display_name.includes(location),
  );

  if (exactMatch) {
    return {
      lat: parseFloat(exactMatch.latitude),
      lng: parseFloat(exactMatch.longitude),
    };
  }

  // 동 이름만으로 검색
  const dongMatch = dongData.find(
    item => item.original_name.includes(dongName) || item.display_name.includes(dongName),
  );

  if (dongMatch) {
    return {
      lat: parseFloat(dongMatch.latitude),
      lng: parseFloat(dongMatch.longitude),
    };
  }

  // 구 이름으로 검색 (동 이름이 없는 경우)
  if (parts.length > 1) {
    const guName = parts[0]; // 첫 번째 부분을 구 이름으로 간주

    const guMatch = dongData.find(
      item => item.original_name.includes(guName) || item.display_name.includes(guName),
    );

    if (guMatch) {
      return {
        lat: parseFloat(guMatch.latitude),
        lng: parseFloat(guMatch.longitude),
      };
    }
  }

  // 아무것도 찾지 못한 경우 null 반환
  return null;
};

// 한글자 동 검색 함수
export const searchSingleCharDong = (dongList: string[], searchText: string): string[] => {
  if (!searchText || searchText.length === 0) {
    return [];
  }

  return dongList.filter(dong => dong.startsWith(searchText) || dong.includes(searchText));
};
