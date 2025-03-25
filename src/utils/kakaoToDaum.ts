// src/utils/api/kakaoToDaum.ts
// DaumAddressData 인터페이스 정의
export interface DaumAddressData {
  address: string;
  zonecode: string;
  roadAddress?: string;
  jibunAddress?: string;
  buildingName?: string;
  apartment?: string;
  sido?: string;
  sigungu?: string;
  bname?: string;
  // 지도 좌표용
  latitude?: number;
  longitude?: number;
}

/**
 * 카카오맵 주소 데이터를 Daum 주소 형식으로 자동 변환
 * @param kakaoData 카카오맵 API에서 반환된 데이터
 * @returns 표준화된 DaumAddressData 객체
 */
export const autoConvertAddress = (kakaoData: any): DaumAddressData => {
  // 기본 빈 주소 데이터
  const defaultData: DaumAddressData = {
    address: '',
    zonecode: '',
  };

  if (!kakaoData) return defaultData;

  try {
    // 카카오맵 API 응답 구조에 맞춰 주소 구성요소 추출
    const data: DaumAddressData = {
      address: kakaoData.address_name || kakaoData.address || '',
      zonecode: kakaoData.zone_code || kakaoData.zonecode || '',
      roadAddress: kakaoData.road_address_name || kakaoData.road_address || '',
      jibunAddress: kakaoData.address_name || kakaoData.jibun_address || '',
      buildingName: kakaoData.building_name || '',
      sido: kakaoData.region_1depth_name || '',
      sigungu: kakaoData.region_2depth_name || '',
      bname: kakaoData.region_3depth_name || '',
    };

    // 좌표 정보가 있으면 추출
    if (kakaoData.x && kakaoData.y) {
      data.longitude = parseFloat(kakaoData.x);
      data.latitude = parseFloat(kakaoData.y);
    }

    return data;
  } catch (error) {
    console.error('카카오 주소 데이터 변환 오류:', error);
    return defaultData;
  }
};
