/// <reference types="@types/google.maps" />

declare namespace google {
  namespace maps {
    class Map {
      constructor(element: HTMLElement, options?: MapOptions);
      panTo(latlng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
    }
    
    class Marker {
      constructor(options?: MarkerOptions);
      setMap(map: Map | null): void;
    }
    
    class LatLngBounds {
      constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
    }
    
    class LatLng {
      lat(): number;
      lng(): number;
    }
    
    namespace places {
      class Autocomplete {
        constructor(inputField: HTMLInputElement, options?: AutocompleteOptions);
        addListener(event: string, handler: () => void): void;
        getPlace(): PlaceResult;
      }
    }
    
    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeControl?: boolean;
      restriction?: {
        latLngBounds: LatLngBounds;
        strictBounds?: boolean;
      };
    }
    
    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
    }
    
    interface LatLngLiteral {
      lat: number;
      lng: number;
    }
    
    interface AutocompleteOptions {
      bounds?: LatLngBounds;
      strictBounds?: boolean;
      fields?: string[];
    }
    
    interface PlaceResult {
      geometry?: {
        location: LatLng;
      };
      name?: string;
      formatted_address?: string;
      place_id?: string;
    }
  }
}

