// src/services/LocationService.ts
import { getLocationId, LocationIdResponse } from './api/modules/place';

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

export const DEFAULT_LOCATION = '서울특별시 영등포구 여의도동';
export const DEFAULT_COORDINATES = { lat: 37.5256, lng: 126.9249 }; // 여의도 좌표

class LocationService {
  private static instance: LocationService;
  private recentLocations: LocationInfo[] = [];
  private currentLocation: LocationInfo | null = null;

  private constructor() {
    // 생성자는 private으로 설정하여 싱글톤 패턴 구현
    this.loadRecentLocations();
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

  // 현재 위치 가져오기
  public async getCurrentLocation(): Promise<LocationInfo | null> {
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

  // 현재 위치 설정
  public setCurrentLocation(location: LocationInfo): void {
    this.currentLocation = location;
    this.addRecentLocation(location);
  }

  // 주소로 위치 ID 조회 함수
  public async getLocationIdByAddress(address: string): Promise<LocationIdInfo | null> {
    try {
      // place 모듈의 getLocationId 함수 호출
      const response = await getLocationId(address);

      if (response) {
        return {
          id: response.id,
          dong: response.dong,
          formatted_address: response.formatted_address,
          latitude: response.latitude,
          longitude: response.longitude,
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
