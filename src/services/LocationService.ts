// src/services/LocationService.ts
import { LocationIdResponse } from './api/modules/place';
import { getLocationInfo } from './api/modules/place';

export interface LocationInfo {
  formatted_address: string;
  display_name: string;
  latitude: string;
  longitude: string;
}

export interface LocationIdInfo {
  id: number;
  dong?: string;
  formatted_address?: string;
  latitude?: number;
  longitude?: number;
}

// Default location - will be overridden with actual location when available
export const DEFAULT_COORDINATES = { lat: 33.4996, lng: 126.5312 }; // 제주시 이도이동 좌표
export const DEFAULT_LOCATION = '제주특별자치도 제주시 이도이동';

class LocationService {
  private static instance: LocationService;
  private recentLocations: LocationInfo[] = [];
  private currentLocation: LocationInfo | null = null;

  private constructor() {
    // 생성자는 private으로 설정하여 싱글톤 패턴 구현
    this.loadRecentLocations();
    this.loadCurrentLocation();
  }

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // 최근 위치 목록 불러오기
  private loadRecentLocations(): void {
    try {
      const savedLocations = localStorage.getItem('recentLocations');
      if (savedLocations) {
        this.recentLocations = JSON.parse(savedLocations);
      }
    } catch (error) {
      console.error('최근 위치 정보 로드 실패:', error);
      this.recentLocations = [];
    }
  }

  // 최근 위치 목록 저장
  private saveRecentLocations(): void {
    try {
      localStorage.setItem('recentLocations', JSON.stringify(this.recentLocations));
    } catch (error) {
      console.error('최근 위치 정보 저장 실패:', error);
    }
  }

  // 최근 위치 추가
  public addRecentLocation(location: LocationInfo): void {
    // 중복 위치 제거
    this.recentLocations = this.recentLocations.filter(
      item => item.formatted_address !== location.formatted_address,
    );

    // 최근 위치 목록 맨 앞에 추가
    this.recentLocations.unshift(location);

    // 최대 5개까지만 저장
    if (this.recentLocations.length > 5) {
      this.recentLocations = this.recentLocations.slice(0, 5);
    }

    // 저장
    this.saveRecentLocations();
  }

  // 최근 위치 목록 가져오기
  public getRecentLocations(): LocationInfo[] {
    return this.recentLocations;
  }

  // 현재 위치 정보 불러오기
  private loadCurrentLocation(): void {
    try {
      const savedLocation = localStorage.getItem('currentLocation');
      if (savedLocation) {
        this.currentLocation = JSON.parse(savedLocation);
      }
    } catch (error) {
      console.error('현재 위치 정보 로드 실패:', error);
      this.currentLocation = null;
    }
  }

  // 현재 위치 정보 저장
  private saveCurrentLocation(): void {
    try {
      if (this.currentLocation) {
        localStorage.setItem('currentLocation', JSON.stringify(this.currentLocation));
      }
    } catch (error) {
      console.error('현재 위치 정보 저장 실패:', error);
    }
  }

  // 현재 위치 가져오기
  public async getCurrentLocation(): Promise<LocationInfo | null> {
    // 1. 먼저 브라우저의 Geolocation API를 사용하여 실제 위치를 가져옵니다.
    if (navigator.geolocation) {
      try {
        // Promise로 Geolocation API 래핑
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            position => resolve(position),
            error => reject(error),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
          );
        });

        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // 좌표를 주소로 변환
        const addressInfo = await this.convertCoordsToAddress(userLat, userLng);

        if (addressInfo) {
          const locationInfo: LocationInfo = {
            formatted_address: addressInfo.shortAddress,
            display_name: addressInfo.shortAddress,
            latitude: userLat.toString(),
            longitude: userLng.toString(),
          };

          // 현재 위치 및 최근 위치 목록 업데이트
          this.setCurrentLocation(locationInfo);
          this.addRecentLocation(locationInfo);

          return locationInfo;
        }
      } catch (error) {
        console.warn('실제 위치 정보를 가져오는데 실패했습니다:', error);
        // 실패 시 아래 기존 로직으로 진행
      }
    }

    // 2. 실제 위치를 가져오는데 실패한 경우, 기존 로직으로 진행
    if (this.currentLocation) {
      return this.currentLocation;
    }

    // 최근 위치가 있으면 첫 번째 위치 사용
    if (this.recentLocations.length > 0) {
      this.currentLocation = this.recentLocations[0];
      return this.currentLocation;
    }

    // 기본 위치 사용
    this.currentLocation = {
      formatted_address: DEFAULT_LOCATION,
      display_name: DEFAULT_LOCATION.split(' ').pop() || '',
      latitude: DEFAULT_COORDINATES.lat.toString(),
      longitude: DEFAULT_COORDINATES.lng.toString(),
    };

    return this.currentLocation;
  }

  // 좌표를 주소로 변환하는 함수
  private async convertCoordsToAddress(
    lat: number,
    lng: number,
  ): Promise<{ shortAddress: string } | null> {
    return new Promise(resolve => {
      try {
        // kakao maps API가 로드되었는지 확인
        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
          const geocoder = new window.kakao.maps.services.Geocoder();

          geocoder.coord2Address(lng, lat, (result: any, status: any) => {
            if (status === 'OK' && result && result.length > 0) {
              const addressResult = result[0];

              // 동/읍/리 단위까지만 추출
              const region1 = addressResult.address.region_1depth_name || ''; // 시/도
              const region2 = addressResult.address.region_2depth_name || ''; // 시/군/구
              const region3 = addressResult.address.region_3depth_name || ''; // 동/읍/면

              // 동/읍/리 단위 주소
              const shortAddress = `${region1} ${region2} ${region3}`.trim();
              resolve({ shortAddress });
            } else {
              resolve(null);
            }
          });
        } else {
          console.error('카카오맵 API가 로드되지 않았습니다.');
          resolve(null);
        }
      } catch (error) {
        console.error('주소 변환 중 예외 발생:', error);
        resolve(null);
      }
    });
  }

  // 현재 위치 설정
  public setCurrentLocation(location: LocationInfo): void {
    this.currentLocation = location;
    this.saveCurrentLocation();
  }

  // 주소로 위치 ID 조회 함수
  public async getLocationIdByAddress(address: string): Promise<LocationIdInfo | null> {
    try {
      // place 모듈의 getLocationInfo 함수 호출
      const response = await getLocationInfo(address);

      if (response?.success && response.data) {
        const locationData = response.data[0];
        return {
          id: locationData.id,
          dong: locationData.dong,
          formatted_address: locationData.formatted_address,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        };
      }

      return null;
    } catch (error) {
      console.error('주소로 위치 ID 조회 실패:', error);
      return null;
    }
  }
}

export default LocationService;
