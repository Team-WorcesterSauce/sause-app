export interface WeatherData {
  temperature: number;
  windDirection: number;
  windSpeed: number;
  cloudDensity: number;
  precipitationType: "rain" | "snow" | "hail" | "none";
  pressure: number;
  humidity: number;
  visibility: number;
  timestamp: Date;
}

export interface DisasterWarning {
  type: "typhoon" | "tornado" | "storm" | "other";
  severity: "low" | "medium" | "high" | "extreme";
  predictedPath: GeoPoint[];
  estimatedArrivalTime: Date;
  estimatedIntensity: number;
  safetyInstructions: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface RouteRecommendation {
  waypoints: GeoPoint[];
  message: string;
}

export interface WeatherOnRoute {
  point: GeoPoint;
  weather: WeatherData;
  timestamp: Date;
}

export interface User {
  id: string;
  preferences: {
    temperatureUnit: "celsius" | "fahrenheit";
    windSpeedUnit: "kmh" | "mph" | "knots";
    distanceUnit: "km" | "miles" | "nauticalMiles";
    useOfflineMode: boolean;
  };
}

export interface CachedData {
  weatherData: WeatherData[];
  timestamp: Date;
  expiresAt: Date;
}

export interface MapViewState {
  center: GeoPoint;
  zoom: number;
  pitch: number;
  bearing: number;
}
