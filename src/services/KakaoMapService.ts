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

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    script.onload = () => {
      console.log(`Script loaded: ${src}`);
      resolve();
    };

    script.onerror = () => {
      const error = new Error(`Failed to load script: ${src}`);
      console.error(error);
      reject(error);
    };

    document.head.appendChild(script);
  });
};

// Kakao Maps SDK가 로드되었는지 확인하는 함수
const isKakaoMapsLoaded = (): boolean => {
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
  // 이미 로드 완료된 경우
  if (loadingStatus.isLoaded && isKakaoMapsLoaded()) {
    console.log('Kakao Maps already loaded and initialized');
    return Promise.resolve();
  }

  // 현재 로딩 중인 경우
  if (loadingStatus.isLoading) {
    console.log('Kakao Maps is currently loading...');
    return new Promise(resolve => {
      callbacks.push(resolve);
    });
  }

  loadingStatus.isLoading = true;
  loadingStatus.error = null;

  // 이 함수는 window.kakao.maps가 이미 로드된 경우에만 작동한다고 가정
  const loadAdditionalScripts = async () => {
    try {
      // 필요한 추가 스크립트 로드
      const mainScriptPromise = loadScript(
        'https://t1.daumcdn.net/mapjsapi/js/main/4.4.19/kakao.js',
      );
      const servicesScriptPromise = loadScript(
        'https://t1.daumcdn.net/mapjsapi/js/libs/services/1.0.2/services.js',
      );

      await Promise.all([mainScriptPromise, servicesScriptPromise]);

      console.log('All Kakao scripts loaded successfully');

      // 서비스 초기화 완료 확인
      if (isKakaoMapsLoaded()) {
        loadingStatus.isLoaded = true;
        loadingStatus.isLoading = false;

        // 대기 중인 모든 콜백 실행
        callbacks.forEach(callback => callback());
        callbacks.length = 0; // 배열 비우기

        console.log('Kakao Maps services ready and initialized');
        return;
      } else {
        const error = new Error('Kakao services not fully initialized');
        console.warn(error);
        throw error;
      }
    } catch (error) {
      loadingStatus.error = error as Error;
      loadingStatus.isLoading = false;
      console.error('Error loading additional scripts:', error);
      throw error;
    }
  };

  // Kakao Maps SDK의 기본 로드 여부에 따라 다르게 처리
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      // 이미 기본 SDK가 로드된 경우 추가 스크립트만 로드
      window.kakao.maps.load(() => {
        console.log('Kakao Maps SDK detected, loading additional scripts...');
        loadAdditionalScripts().then(resolve).catch(reject);
      });
    } else {
      // SDK 자체가 로드되지 않은 경우, 에러 처리
      const error = new Error(
        'Kakao SDK not loaded properly - please ensure the Kakao SDK script is included in your application',
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
  return { ...loadingStatus };
};

// React Hook으로 사용하기 위한 export 추가 - 필요한 경우 별도로 구현할 수 있음

export default {
  initializeKakaoMaps,
  getKakaoMapsLoadingStatus,
};
