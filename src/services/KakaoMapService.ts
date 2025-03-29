// src/services/KakaoMapsService.ts
// 카카오맵 API를 전역적으로 관리하는 서비스

// 카카오맵 API 로딩 상태를 추적하는 인터페이스
interface KakaoMapsLoadingStatus {
  isLoading: boolean;
  isLoaded: boolean;
  error: Error | null;
}

// 스크립트 로딩 추적을 위한 상태 객체
const loadingStatus: KakaoMapsLoadingStatus = {
  isLoading: false,
  isLoaded: false,
  error: null,
};

// 로딩 완료 시 실행할 콜백 함수들을 저장
const callbacks: Array<() => void> = [];

// 특정 스크립트 로딩 여부 확인 (중복 로딩 방지)
const isScriptLoaded = (src: string): boolean => {
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i].src === src) {
      return true;
    }
  }
  return false;
};

// 단일 스크립트 로딩 함수
const loadScript = (src: string): Promise<void> => {
  // 이미 로드된 스크립트는 다시 로드하지 않음
  if (isScriptLoaded(src)) {
    console.log(`Script already loaded: ${src}`);
    return Promise.resolve();
  }

  console.log(`스크립트 로딩 시작: ${src}`);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    script.onload = () => {
      console.log(`스크립트 로딩 완료: ${src}`);
      resolve();
    };

    script.onerror = () => {
      const error = new Error(`스크립트 로딩 실패: ${src}`);
      console.error(error);
      reject(error);
    };

    document.head.appendChild(script);
  });
};

// Kakao Maps SDK가 로드되었는지 확인하는 함수
const isKakaoMapsLoaded = (): boolean => {
  console.log('카카오맵 SDK 상태 확인:');
  console.log('- window.kakao:', typeof window.kakao !== 'undefined' ? '존재함' : '존재하지 않음');

  if (typeof window.kakao !== 'undefined') {
    console.log(
      '- window.kakao.maps:',
      typeof window.kakao.maps !== 'undefined' ? '존재함' : '존재하지 않음',
    );

    if (typeof window.kakao.maps !== 'undefined') {
      console.log(
        '- window.kakao.maps.services:',
        typeof window.kakao.maps.services !== 'undefined' ? '존재함' : '존재하지 않음',
      );

      if (typeof window.kakao.maps.services !== 'undefined') {
        console.log(
          '- window.kakao.maps.services.Places:',
          typeof window.kakao.maps.services.Places !== 'undefined' ? '존재함' : '존재하지 않음',
        );
        console.log(
          '- window.kakao.maps.services.Geocoder:',
          typeof window.kakao.maps.services.Geocoder !== 'undefined' ? '존재함' : '존재하지 않음',
        );
      }
    }
  }

  return (
    typeof window.kakao !== 'undefined' &&
    typeof window.kakao.maps !== 'undefined' &&
    typeof window.kakao.maps.services !== 'undefined' &&
    typeof window.kakao.maps.services.Places !== 'undefined' &&
    typeof window.kakao.maps.services.Geocoder !== 'undefined'
  );
};

// Kakao Maps API 초기화를 위한 메인 함수
export const initializeKakaoMaps = (): Promise<void> => {
  console.log('카카오맵 초기화 함수 호출됨');

  // 이미 로드 완료된 경우
  if (loadingStatus.isLoaded && isKakaoMapsLoaded()) {
    console.log('카카오맵이 이미 로드되고 초기화되었습니다');
    return Promise.resolve();
  }

  // 현재 로딩 중인 경우
  if (loadingStatus.isLoading) {
    console.log('카카오맵이 현재 로딩 중입니다. 콜백을 추가합니다.');
    return new Promise(resolve => {
      callbacks.push(resolve);
    });
  }

  console.log('카카오맵 초기화 시작');
  loadingStatus.isLoading = true;
  loadingStatus.error = null;

  // 이 함수는 window.kakao.maps가 이미 로드된 경우에만 작동한다고 가정
  const loadAdditionalScripts = async () => {
    try {
      console.log('추가 스크립트 로딩 시작');
      // 필요한 추가 스크립트 로드
      const mainScriptPromise = loadScript(
        'https://t1.daumcdn.net/mapjsapi/js/main/4.4.19/kakao.js',
      );
      const servicesScriptPromise = loadScript(
        'https://t1.daumcdn.net/mapjsapi/js/libs/services/1.0.2/services.js',
      );

      await Promise.all([mainScriptPromise, servicesScriptPromise]);

      console.log('모든 카카오 스크립트 로딩 완료');

      // 서비스 초기화 완료 확인
      if (isKakaoMapsLoaded()) {
        loadingStatus.isLoaded = true;
        loadingStatus.isLoading = false;

        // 대기 중인 모든 콜백 실행
        console.log(`${callbacks.length}개의 대기 중인 콜백 실행`);
        callbacks.forEach(callback => callback());
        callbacks.length = 0; // 배열 비우기

        console.log('카카오맵 서비스 준비 완료 및 초기화 완료');
        return;
      } else {
        const error = new Error('카카오 서비스가 완전히 초기화되지 않았습니다');
        console.warn(error);
        throw error;
      }
    } catch (error) {
      loadingStatus.error = error as Error;
      loadingStatus.isLoading = false;
      console.error('추가 스크립트 로딩 중 오류:', error);
      throw error;
    }
  };

  // Kakao Maps SDK의 기본 로드 여부에 따라 다르게 처리
  return new Promise((resolve, reject) => {
    console.log('window.kakao 존재 여부 확인:', window.kakao ? '존재함' : '존재하지 않음');
    console.log(
      'window.kakao.maps 존재 여부 확인:',
      window.kakao?.maps ? '존재함' : '존재하지 않음',
    );

    if (window.kakao && window.kakao.maps) {
      // 이미 기본 SDK가 로드된 경우 추가 스크립트만 로드
      console.log('카카오맵 SDK 감지됨, 추가 스크립트 로드 시작...');
      window.kakao.maps.load(() => {
        console.log('카카오맵 로드 콜백 호출됨');
        loadAdditionalScripts().then(resolve).catch(reject);
      });
    } else {
      // SDK 자체가 로드되지 않은 경우, 에러 처리
      const error = new Error(
        '카카오 SDK가 제대로 로드되지 않았습니다 - 애플리케이션에 카카오 SDK 스크립트가 포함되어 있는지 확인하세요',
      );
      loadingStatus.error = error;
      loadingStatus.isLoading = false;
      console.error(error);
      reject(error);
    }
  });
};

// 현재 로딩 상태 반환
export const getKakaoMapsLoadingStatus = (): KakaoMapsLoadingStatus => {
  console.log('현재 카카오맵 로딩 상태:', loadingStatus);
  return { ...loadingStatus };
};

// React Hook으로 사용하기 위한 export 추가 - 필요한 경우 별도로 구현할 수 있음

export default {
  initializeKakaoMaps,
  getKakaoMapsLoadingStatus,
};
