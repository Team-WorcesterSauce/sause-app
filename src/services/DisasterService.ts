import { GeoPoint, DisasterPrediction } from "../models/types";

/**
 * Service for handling disaster predictions and warnings
 */
export class DisasterService {
  private static readonly API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

  /**
   * Gets disaster prediction for a specific location
   */
  static async getDisasterPrediction(
    location: GeoPoint
  ): Promise<DisasterPrediction> {
    try {
      const params = new URLSearchParams({
        lat: Number(location.latitude).toFixed(6),
        lon: Number(location.longitude).toFixed(6),
      });

      const response = await fetch(`${this.API_BASE_URL}/disaster?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching disaster prediction:", error);

      // Fallback to mock data if API call fails
      return this.getMockDisasterPrediction(location);
    }
  }

  /**
   * Fallback mock implementation
   */
  private static getMockDisasterPrediction(
    location: GeoPoint
  ): DisasterPrediction {
    const predictions = [
      {
        prediction: "안전",
        message: "현재 위치에서 예상되는 재난 위험이 낮습니다. 정상적인 항해가 가능합니다.",
      },
      {
        prediction: "주의",
        message: "약한 강풍이 예상됩니다. 항해 시 주의가 필요합니다.",
      },
      {
        prediction: "경고",
        message: "강한 폭풍이 접근 중입니다. 항해를 자제하고 안전한 장소로 대피하세요.",
      },
      {
        prediction: "위험",
        message: "태풍이 접근 중입니다. 즉시 항해를 중단하고 안전한 항구로 대피하세요.",
      },
    ];

    // 위치에 따라 다른 예측 반환 (데모용)
    const index = Math.floor(Math.abs(location.latitude + location.longitude) % 4);
    
    return predictions[index];
  }
}
