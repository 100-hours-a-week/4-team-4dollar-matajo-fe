// Daum 주소 API로부터 반환되는 데이터 타입 정의
export interface DaumAddressData {
  postcode: string;
  postcode1: string;
  postcode2: string;
  postcode_seq: string;
  zonecode: string;
  address: string;
  address_english: string;
  address_type: string;
  bcode: string;
  bname: string;
  bname_english: string;
  bname1: string;
  bname1_english: string;
  bname2: string;
  bname2_english: string;
  sido: string;
  sido_english: string;
  sigungu: string;
  sigungu_english: string;
  sigungu_code: string;
  user_language_type: string;
  query: string;
  building_name: string;
  building_code: string;
  apartment: string;
  jibun_address: string;
  jibun_address_english: string;
  road_address: string;
  road_address_english: string;
  auto_road_address: string;
  auto_road_address_english: string;
  auto_jibun_address: string;
  auto_jibun_address_english: string;
  user_selected_type: string;
  no_selected: string;
  hname: string;
  roadname_code: string;
  roadname: string;
  roadname_english: string;
}

/**
 * Kakao 맵 API로부터 받은 주소를 Daum 주소 API를 사용해 상세 주소 데이터로 변환
 * 실제 API를 호출하여 주소 정보를 가져옴
 *
 * @param address Kakao 맵 API에서 받은 주소 문자열
 * @returns Promise<DaumAddressData> Daum 주소 API 형식의 상세 주소 데이터
 */
export const convertKakaoToDaumAddress = (address: string): Promise<DaumAddressData> => {
  return new Promise((resolve, reject) => {
    // 이미 로드된 다음 주소 API가 있는지 확인
    if ((window as any).daum && (window as any).daum.Postcode) {
      openDaumPostcode(address, resolve, reject);
    } else {
      // Daum 주소 API 스크립트 동적 로드
      const script = document.createElement('script');
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.onload = () => openDaumPostcode(address, resolve, reject);
      script.onerror = () => reject(new Error('다음 주소 API 로드에 실패했습니다.'));
      document.head.appendChild(script);
    }
  });
};

/**
 * 실제 다음 주소 API를 사용하여 주소 검색 수행
 * 사용자에게 주소 검색 팝업을 보여줌
 */
const openDaumPostcode = (
  address: string,
  resolve: (data: DaumAddressData) => void,
  reject: (error: Error) => void,
) => {
  try {
    const daum = (window as any).daum;

    // 다음 주소 검색 팝업 열기
    new daum.Postcode({
      oncomplete: function (data: DaumAddressData) {
        console.log('다음 주소 검색 완료:', data);

        // 카멜 케이스를 스네이크 케이스로 변환하는 함수
        const camelToSnake = (str: string): string => {
          return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        };

        // 객체의 모든 키를 스네이크 케이스로 변환
        const convertKeys = (obj: any): any => {
          if (obj === null || typeof obj !== 'object') {
            return obj;
          }

          if (Array.isArray(obj)) {
            return obj.map(item => convertKeys(item));
          }

          const snakeCaseObj: any = {};
          Object.keys(obj).forEach(key => {
            const snakeKey = camelToSnake(key);
            snakeCaseObj[snakeKey] = convertKeys(obj[key]);
          });

          return snakeCaseObj;
        };

        // 변환된 데이터로 resolve 호출
        const snakeCaseData = convertKeys(data);
        console.log('스네이크 케이스로 변환된 데이터:', snakeCaseData);
        resolve(snakeCaseData);
      },
      onresize: function (size: any) {
        // 팝업창 크기 조정 이벤트
      },
      onclose: function (state: string) {
        // 사용자가 검색을 취소한 경우
        if (state === 'FORCE_CLOSE') {
          reject(new Error('사용자가 주소 검색을 취소했습니다.'));
        }
      },
      width: '100%',
      height: '100%',
    }).open({
      q: address, // 검색어 설정
      left: window.screen.width / 2 - 500 / 2, // 팝업 너비 기본값 500px
      top: window.screen.height / 2 - 600 / 2, // 팝업 높이 기본값 600px
      popupName: 'postcodePopup',
    });
  } catch (error) {
    reject(error instanceof Error ? error : new Error('주소 검색 중 오류가 발생했습니다.'));
  }
};

/**
 * 주소 검색을 백그라운드에서 처리하려고 시도하는 함수
 *
 * 참고: 다음 주소 API는 직접적인 REST API를 제공하지 않고 팝업 UI를 통해 사용자 선택을 요구함
 * 따라서 이 함수는 사용자에게 주소 검색 팝업을 보여줌
 *
 * @param address Kakao 맵 API에서 받은 주소 문자열
 * @returns Daum 주소 API 형식의 상세 주소 데이터
 */
export const autoConvertAddress = async (address: string): Promise<DaumAddressData> => {
  try {
    // 백엔드 API가 있다면 여기서 호출할 수 있지만, 다음 주소 API는 직접 호출 방식을 지원하지 않음
    // 따라서 UI를 통한 방식으로 폴백
    console.log('주소 검색 시작:', address);
    return await convertKakaoToDaumAddress(address);
  } catch (error) {
    console.error('주소 검색 실패:', error);
    throw error;
  }
};
