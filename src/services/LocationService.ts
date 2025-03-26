// src/services/LocationService.ts

// Location data interface
export interface LocationInfo {
  formatted_address: string;
  display_name: string;
  latitude: string;
  longitude: string;
}

// Default location - will be overridden with actual location when available
export const DEFAULT_COORDINATES = { lat: 37.5244, lng: 126.9231 };
export const DEFAULT_LOCATION = '서울특별시 영등포구 여의도동';

// Store recently used locations
class LocationService {
  private static instance: LocationService;
  private recentLocations: LocationInfo[] = [];
  private currentLocation: LocationInfo | null = null;
  private dongData: DongData[] = [];
  private isInitialized = false;

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

  // Initialize with dong data
  public initialize(dongData: DongData[]): void {
    this.dongData = dongData;
    this.isInitialized = true;
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

          // Find nearest location in dongData
          const location = await this.reverseGeocode(latitude, longitude);
          if (location) {
            this.currentLocation = location;
            resolve(location);
          } else {
            // Fallback to default location if reverse geocoding fails
            const defaultLocation: LocationInfo = {
              formatted_address: DEFAULT_LOCATION,
              display_name: DEFAULT_LOCATION,
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

  // Reverse geocode coordinates to location name
  private async reverseGeocode(latitude: number, longitude: number): Promise<LocationInfo | null> {
    // In a real app, this would use Kakao Maps or another geocoding service
    // For now, find the closest matching location in dongData
    if (!this.isInitialized || this.dongData.length === 0) {
      return null;
    }

    let closestLocation: DongData | null = null;
    let minDistance = Number.MAX_VALUE;

    for (const dong of this.dongData) {
      if (!dong || !dong.latitude || !dong.longitude) {
        continue;
      }

      const dongLat = parseFloat(dong.latitude);
      const dongLng = parseFloat(dong.longitude);

      if (isNaN(dongLat) || isNaN(dongLng)) {
        continue;
      }

      const distance = this.calculateDistance(latitude, longitude, dongLat, dongLng);

      if (distance < minDistance) {
        minDistance = distance;
        closestLocation = dong;
      }
    }

    if (closestLocation) {
      // Here we correctly access the properties that we confirmed exist in the CSV
      return {
        formatted_address: closestLocation.formatted_address || DEFAULT_LOCATION,
        display_name: closestLocation.display_name || DEFAULT_LOCATION,
        latitude: closestLocation.latitude || DEFAULT_COORDINATES.lat.toString(),
        longitude: closestLocation.longitude || DEFAULT_COORDINATES.lng.toString(),
      };
    }

    return null;
  }

  // Simple distance calculation using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
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
