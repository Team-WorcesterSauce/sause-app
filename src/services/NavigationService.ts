import {
  GeoPoint,
  RouteRecommendation,
  WeatherData,
  WeatherOnRoute,
} from "../models/types";
import { WeatherService } from "./WeatherService";

/**
 * Service for handling route recommendations and navigation
 */
export class NavigationService {
  /**
   * Generates a recommended route based on start and end points
   */
  static async getRecommendedRoute(
    startPoint: GeoPoint,
    endPoint: GeoPoint
  ): Promise<RouteRecommendation> {
    try {
      // In a real implementation, this would call an API service that considers:
      // 1. Current and forecasted weather along potential routes
      // 2. Marine traffic and obstacles
      // 3. Optimal path calculation

      // For this example, we'll create a simplified mock implementation

      // Calculate the direct distance
      const distance = this.calculateDistance(startPoint, endPoint);

      // Create waypoints (simple linear interpolation for demo)
      const waypoints: GeoPoint[] = this.generateWaypoints(
        startPoint,
        endPoint,
        5
      );

      // Fetch weather data for each waypoint (in a real app, would be more sophisticated)
      const weatherOnRoute: WeatherOnRoute[] =
        await this.fetchWeatherForWaypoints(waypoints);

      // Calculate safety score based on weather conditions (simplified)
      const safetyScore = this.calculateSafetyScore(weatherOnRoute);

      // Calculate estimated travel time (very simplified)
      // Assuming an average speed of 20 km/h
      const estimatedTravelTime = (distance * 60) / 20; // convert to minutes

      return {
        startPoint,
        endPoint,
        waypoints,
        distance,
        estimatedTravelTime,
        safetyScore,
        weatherConditionsOnRoute: weatherOnRoute,
      };
    } catch (error) {
      console.error("Error getting recommended route:", error);
      throw error;
    }
  }

  /**
   * Calculates the distance between two points in kilometers
   */
  private static calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = this.deg2rad(point2.latitude - point1.latitude);
    const dLon = this.deg2rad(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.latitude)) *
        Math.cos(this.deg2rad(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Generate waypoints between start and end points
   */
  private static generateWaypoints(
    start: GeoPoint,
    end: GeoPoint,
    count: number
  ): GeoPoint[] {
    const waypoints: GeoPoint[] = [];

    for (let i = 1; i <= count; i++) {
      const fraction = i / (count + 1);
      waypoints.push({
        latitude: start.latitude + fraction * (end.latitude - start.latitude),
        longitude:
          start.longitude + fraction * (end.longitude - start.longitude),
      });
    }

    return waypoints;
  }

  /**
   * Fetch weather data for each waypoint
   */
  private static async fetchWeatherForWaypoints(
    waypoints: GeoPoint[]
  ): Promise<WeatherOnRoute[]> {
    const weatherPromises = waypoints.map(async (point) => {
      try {
        const weather = await WeatherService.getCurrentWeather(point);
        return {
          point,
          weather,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("Error fetching weather for waypoint:", error);
        // Provide fallback data if API call fails
        return {
          point,
          weather: this.getFallbackWeatherData(),
          timestamp: new Date(),
        };
      }
    });

    return Promise.all(weatherPromises);
  }

  /**
   * Calculate a safety score based on weather conditions
   */
  private static calculateSafetyScore(
    weatherOnRoute: WeatherOnRoute[]
  ): number {
    if (weatherOnRoute.length === 0) return 50; // default medium score if no data

    // Calculate based on various weather factors
    let totalScore = 0;

    for (const point of weatherOnRoute) {
      const weather = point.weather;
      let pointScore = 100;

      // Reduce score based on bad weather conditions

      // Wind speed factor (stronger winds reduce safety)
      if (weather.windSpeed > 20) pointScore -= 30;
      else if (weather.windSpeed > 15) pointScore -= 20;
      else if (weather.windSpeed > 10) pointScore -= 10;

      // Precipitation factor
      if (weather.precipitationType === "hail") pointScore -= 30;
      else if (weather.precipitationType === "snow") pointScore -= 20;
      else if (weather.precipitationType === "rain") pointScore -= 10;

      // Visibility factor
      if (weather.visibility < 2) pointScore -= 25;
      else if (weather.visibility < 5) pointScore -= 15;
      else if (weather.visibility < 8) pointScore -= 5;

      // Add more factors as needed

      // Ensure score stays in valid range
      pointScore = Math.max(0, Math.min(100, pointScore));

      totalScore += pointScore;
    }

    return Math.round(totalScore / weatherOnRoute.length);
  }

  /**
   * Provides fallback weather data if API call fails
   */
  private static getFallbackWeatherData(): WeatherData {
    return {
      temperature: 20,
      windDirection: 180,
      windSpeed: 5,
      cloudDensity: 30,
      precipitationType: "none",
      pressure: 1013,
      humidity: 60,
      visibility: 10,
      timestamp: new Date(),
    };
  }

  /**
   * Convert degrees to radians
   */
  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
