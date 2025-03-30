interface Window {
  kakao: {
    maps: {
      load: (callback: () => void) => void;
      LatLng: new (lat: number, lng: number) => any;
      Map: new (container: HTMLElement, options: any) => any;
      MapTypeControl: new () => any;
      ZoomControl: new () => any;
      ControlPosition: {
        TOPRIGHT: any;
        RIGHT: any;
      };
      event: {
        addListener: (target: any, type: string, handler: () => void) => void;
      };
      Size: new (width: number, height: number) => any;
      Point: new (x: number, y: number) => any;
      MarkerImage: new (src: string, size: any, options: any) => any;
      Marker: new (options: any) => any;
      InfoWindow: new (options: any) => any;
      services: {
        Places: any;
        Geocoder: any;
      };
    };
  };
  daum: {
    Postcode: new (config: { oncomplete: (data: any) => void; [key: string]: any }) => {
      open: () => void;
    };
  };
}
