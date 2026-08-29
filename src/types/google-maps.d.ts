declare namespace google.maps {
  class Map {
    constructor(element: HTMLElement, options: MapOptions);
    setCenter(latLng: LatLngLiteral): void;
    fitBounds(bounds: LatLngBounds, padding?: number | Padding): void;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(latLng: LatLngLiteral): void;
    setIcon(icon: string | Icon | Symbol): void;
  }

  class Polyline {
    constructor(options: PolylineOptions);
    setPath(path: LatLngLiteral[]): void;
    setMap(map: Map | null): void;
  }

  class LatLngBounds {
    extend(point: LatLngLiteral): void;
  }

  interface MapOptions {
    center?: LatLngLiteral;
    zoom?: number;
    disableDefaultUI?: boolean;
    zoomControl?: boolean;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
  }

  interface MarkerOptions {
    map?: Map;
    position?: LatLngLiteral;
    title?: string;
    icon?: string | Icon | Symbol;
    zIndex?: number;
  }

  interface PolylineOptions {
    map?: Map;
    path?: LatLngLiteral[];
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface Icon {
    path?: string | Symbol;
    scale?: number;
    rotation?: number;
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWeight?: number;
  }

  interface Symbol {
    path?: string;
    scale?: number;
    rotation?: number;
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWeight?: number;
  }

  namespace SymbolPath {
    const FORWARD_CLOSED_ARROW: string;
  }

  interface Padding {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  }
}

interface Window {
  google?: {
    maps: typeof google.maps;
  };
}
