export interface EarthVisualizationResponse {
  centerLon: number;
  searchRadiusDegrees: number;
  eventLocations: EventLocation[];
}

export interface EventLocation {
  types: string[];
  lon: number;
  lat: number;
} 