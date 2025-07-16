import { GeoPoint, RouteRecommendation } from "../models/types";

/**
 * Service for handling route recommendations and navigation
 */
export class NavigationService {
  private static readonly API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

  /**
   * Generates a recommended route based on start and end points
   */
  static async getRecommendedRoute(
    startPoint: GeoPoint,
    endPoint: GeoPoint
  ): Promise<RouteRecommendation> {
    try {
      const params = {
        startLat: Number(startPoint.latitude).toFixed(4),
        startLon: Number(startPoint.longitude).toFixed(4),
        endLat: Number(endPoint.latitude).toFixed(4),
        endLon: Number(endPoint.longitude).toFixed(4),
      };

      const response = await fetch(`${this.API_BASE_URL}/route`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching route:", error);

      // Fallback to mock data if API call fails
      return this.getMockRoute(startPoint, endPoint);
    }
  }

  /**
   * Fallback mock implementation
   */
  private static getMockRoute(
    startPoint: GeoPoint,
    endPoint: GeoPoint
  ): RouteRecommendation {
    // Generate waypoints including start and end points
    const intermediateWaypoints = this.generateWaypoints(
      startPoint,
      endPoint,
      3
    );
    const waypoints: GeoPoint[] = [
      startPoint,
      ...intermediateWaypoints,
      endPoint,
    ];

    return {
      waypoints,
      message:
        "Mock route generated successfully. API connection failed, showing demo data.",
    };
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
}
