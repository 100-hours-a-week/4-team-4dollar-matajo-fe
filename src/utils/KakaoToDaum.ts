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
 *
 * @param address Kakao 맵 API에서 받은 주소 문자열
 * @returns Daum 주소 API 형식의 상세 주소 데이터
 */
export const convertKakaoToDaumAddress = (address: string): Promise<DaumAddressData> => {
  return new Promise((resolve, reject) => {
    // 이미 로드된 다음 주소 API가 있는지 확인
    if ((window as any).daum && (window as any).daum.Postcode) {
      performAddressSearch(address, resolve, reject);
    } else {
      // Daum 주소 API 스크립트 동적 로드
      const script = document.createElement('script');
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.onload = () => performAddressSearch(address, resolve, reject);
      script.onerror = () => reject(new Error('다음 주소 API 로드에 실패했습니다.'));
      document.head.appendChild(script);
    }
  });
};

/**
 * 다음 주소 API를 사용하여 주소 검색 수행
 */
const performAddressSearch = (
  address: string,
  resolve: (data: DaumAddressData) => void,
  reject: (error: Error) => void,
) => {
  try {
    const daum = (window as any).daum;

    // 다음 주소 검색 객체 생성
    new daum.Postcode({
      oncomplete: function (data: DaumAddressData) {
        resolve(data);
      },
      onresize: function (size: any) {
        // 팝업창 크기 조정 이벤트 (필요시 구현)
      },
      onclose: function (state: string) {
        // 사용자가 검색을 취소한 경우
        if (state === 'FORCE_CLOSE') {
          reject(new Error('사용자가 주소 검색을 취소했습니다.'));
        }
      },
      width: '100%',
      height: '100%',
    }).embed(document.createElement('div'), {
      q: address, // 검색어 설정
      autoClose: true, // 검색 완료 시 자동으로 팝업 닫기
    });
  } catch (error) {
    reject(error instanceof Error ? error : new Error('주소 검색 중 오류가 발생했습니다.'));
  }
};

/**
 * 자동으로 주소 검색 (백그라운드에서 처리하는 방식)
 *
 * 다음 주소 API는 기본적으로 UI를 통한 사용자 선택을 요구하지만,
 * 이 함수는 가능한 경우 자동으로 가장 적합한 결과를 선택
 *
 * @param address Kakao 맵 API에서 받은 주소 문자열
 * @returns Daum 주소 API 형식의 상세 주소 데이터
 */
export const autoConvertAddress = async (address: string): Promise<DaumAddressData> => {
  try {
    // 직접 API 호출로 주소 검색 시도 (프록시 서버 필요)
    // 실제 구현에서는 백엔드에 요청하거나 CORS 이슈를 해결해야 함
    const response = await fetch(`/api/address/search?query=${encodeURIComponent(address)}`);

    if (!response.ok) {
      throw new Error('주소 검색 API 호출 실패');
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0]; // 첫 번째 결과 사용
    }

    throw new Error('주소 검색 결과가 없습니다.');
  } catch (error) {
    console.error('자동 주소 변환 실패, 대화형 검색으로 전환:', error);
    // 자동 변환 실패 시 대화형 검색으로 폴백
    return convertKakaoToDaumAddress(address);
  }
};

/**
 * 더미 주소 데이터 생성 (테스트/개발용)
 *
 * @param address 기준 주소 문자열
 * @returns 더미 DaumAddressData 객체
 */
export const generateDummyAddressData = (address: string): DaumAddressData => {
  const isSeoul = address.includes('서울');
  const isGangnam = address.includes('강남');

  return {
    postcode: '',
    postcode1: '',
    postcode2: '',
    postcode_seq: '',
    zonecode: isSeoul ? '06253' : '12345',
    address: address,
    address_english: isSeoul
      ? '298 Gangnam-daero, Gangnam-gu, Seoul, Republic of Korea'
      : 'Example address, Republic of Korea',
    address_type: 'R',
    bcode: isGangnam ? '1168010100' : '0000000000',
    bname: isGangnam ? '역삼동' : '지역명',
    bname_english: isGangnam ? 'Yeoksam-dong' : 'Area name',
    bname1: '',
    bname1_english: '',
    bname2: isGangnam ? '역삼동' : '지역명',
    bname2_english: isGangnam ? 'Yeoksam-dong' : 'Area name',
    sido: isSeoul ? '서울' : '도시명',
    sido_english: isSeoul ? 'Seoul' : 'City',
    sigungu: isGangnam ? '강남구' : '구 이름',
    sigungu_english: isGangnam ? 'Gangnam-gu' : 'District',
    sigungu_code: isGangnam ? '11680' : '00000',
    user_language_type: 'K',
    query: address,
    building_name: isGangnam ? 'KB라이프타워' : '',
    building_code: isGangnam ? '1168010100108380001026116' : '',
    apartment: 'N',
    jibun_address: isSeoul ? `서울 ${isGangnam ? '강남구 역삼동 838' : '지역구 동 번지'}` : address,
    jibun_address_english: isGangnam
      ? '838 Yeoksam-dong, Gangnam-gu, Seoul, Republic of Korea'
      : 'Example jibun address, Republic of Korea',
    road_address: isSeoul
      ? `서울 ${isGangnam ? '강남구 강남대로 298' : '지역구 도로명 번호'}`
      : address,
    road_address_english: isGangnam
      ? '298 Gangnam-daero, Gangnam-gu, Seoul, Republic of Korea'
      : 'Example road address, Republic of Korea',
    auto_road_address: '',
    auto_road_address_english: '',
    auto_jibun_address: '',
    auto_jibun_address_english: '',
    user_selected_type: 'J',
    no_selected: 'N',
    hname: '',
    roadname_code: isGangnam ? '2102001' : '0000000',
    roadname: isGangnam ? '강남대로' : '도로명',
    roadname_english: isGangnam ? 'Gangnam-daero' : 'Road name',
  };
};
