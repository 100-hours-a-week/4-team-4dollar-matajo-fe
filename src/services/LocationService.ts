// src/services/LocationService.ts
import { getLocationId } from './api/modules/place';

// Location data interface
export interface LocationInfo {
  formatted_address: string;
  display_name: string;
  latitude: string;
  longitude: string;
}

// 위치 ID 정보 인터페이스
export interface LocationIdInfo {
  id: number;
  dong: string;
  formatted_address: string;
}

// Default location - will be overridden with actual location when available
export const DEFAULT_COORDINATES = { lat: 37.5244, lng: 126.9231 };
export const DEFAULT_LOCATION = '서울특별시 영등포구 여의도동';

// Store recently used locations
class LocationService {
  private static instance: LocationService;
  private recentLocations: LocationInfo[] = [];
  private currentLocation: LocationInfo | null = null;
  private currentLocationId: LocationIdInfo | null = null;

  private constructor() {
    // Load recent locations from localStorage
    this.loadRecentLocations();
  }

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Get user's current location
  public async getCurrentLocation(): Promise<LocationInfo | null> {
    if (this.currentLocation) {
      return this.currentLocation;
    }

    return new Promise(resolve => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;

          try {
            // 역지오코딩 API 호출 (실제 앱에서는 Kakao API 호출)
            // 여기서는 테스트용으로 기본 위치 값을 사용합니다
            const location: LocationInfo = {
              formatted_address: DEFAULT_LOCATION,
              display_name: '여의도동',
              latitude: latitude.toString(),
              longitude: longitude.toString(),
            };

            this.currentLocation = location;
            resolve(location);
          } catch (error) {
            console.error('역지오코딩 오류:', error);
            // 오류 시 기본 위치 사용
            const defaultLocation: LocationInfo = {
              formatted_address: DEFAULT_LOCATION,
              display_name: '여의도동',
              latitude: DEFAULT_COORDINATES.lat.toString(),
              longitude: DEFAULT_COORDINATES.lng.toString(),
            };
            resolve(defaultLocation);
          }
        },
        error => {
          console.error('Error getting current location:', error);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }

  // 주소 기반 위치 ID 조회 및 저장
  public async getLocationIdByAddress(formattedAddress: string): Promise<LocationIdInfo | null> {
    try {
      // place.ts의 getLocationId API 호출
      const locationId = await getLocationId(formattedAddress);

      if (locationId) {
        this.currentLocationId = locationId;
        return locationId;
      }

      return null;
    } catch (error) {
      console.error('위치 ID 조회 오류:', error);
      return null;
    }
  }

  // 현재 위치 ID 조회
  public getCurrentLocationId(): LocationIdInfo | null {
    return this.currentLocationId;
  }

  // 위치 ID 저장
  public setCurrentLocationId(locationId: LocationIdInfo): void {
    this.currentLocationId = locationId;
  }

  // Add a location to recent searches
  public addRecentLocation(location: LocationInfo): void {
    // Remove if it already exists (to avoid duplicates)
    this.recentLocations = this.recentLocations.filter(
      loc => loc.formatted_address !== location.formatted_address,
    );

    // Add to beginning of array
    this.recentLocations.unshift(location);

    // Keep only the 5 most recent
    if (this.recentLocations.length > 5) {
      this.recentLocations = this.recentLocations.slice(0, 5);
    }

    // Save to localStorage
    this.saveRecentLocations();
  }

  // Get recent locations
  public getRecentLocations(): LocationInfo[] {
    return [...this.recentLocations];
  }

  // Load recent locations from localStorage
  private loadRecentLocations(): void {
    try {
      const savedLocations = localStorage.getItem('recentLocationSearches');
      if (savedLocations) {
        this.recentLocations = JSON.parse(savedLocations);
      }
    } catch (error) {
      console.error('Error loading recent locations:', error);
      this.recentLocations = [];
    }
  }

  // Save recent locations to localStorage
  private saveRecentLocations(): void {
    try {
      localStorage.setItem('recentLocationSearches', JSON.stringify(this.recentLocations));
    } catch (error) {
      console.error('Error saving recent locations:', error);
    }
  }
}

export default LocationService;
