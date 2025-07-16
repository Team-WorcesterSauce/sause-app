import { WeatherData, GeoPoint, DisasterWarning } from "../models/types";
import { OPENWEATHER_API_KEY, WEATHERSTACK_API_KEY, KMA_API_KEY } from "@env";

/**
 * Fetches current weather data based on location
 */
export async function getCurrentWeather(
  location: GeoPoint
): Promise<WeatherData> {
  try {
    // Primary source: OpenWeatherMap
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${
        location.latitude
      }&lon=${location.longitude}&appid=${
        OPENWEATHER_API_KEY || "YOUR_OPENWEATHER_API_KEY"
      }&units=metric`
    );

    if (!response.ok) {
      throw new Error("날씨 데이터 가져오기 실패");
    }

    const data = await response.json();

    return {
      temperature: data.main.temp,
      windDirection: data.wind.deg,
      windSpeed: data.wind.speed,
      cloudDensity: data.clouds.all,
      precipitationType: determinePrecipitationType(data.weather[0].id),
      pressure: data.main.pressure,
      humidity: data.main.humidity,
      visibility: data.visibility / 1000, // Convert meters to kilometers
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("날씨 데이터 가져오기 오류:", error);
    throw error;
  }
}

/**
 * Helper method to determine precipitation type based on weather condition ID
 */
function determinePrecipitationType(
  conditionId: number
): "rain" | "snow" | "hail" | "none" {
  // Based on OpenWeatherMap condition codes
  if (conditionId >= 200 && conditionId < 300) return "hail"; // Thunderstorm
  if (conditionId >= 300 && conditionId < 600) return "rain"; // Drizzle and Rain
  if (conditionId >= 600 && conditionId < 700) return "snow"; // Snow
  return "none";
}

/**
 * Weather Service for fetching weather data from multiple sources
 */
export class WeatherService {
  /**
   * Fetches current weather data based on location
   */
  static async getCurrentWeather(location: GeoPoint): Promise<WeatherData> {
    try {
      // Primary source: OpenWeatherMap
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const data = await response.json();

      return {
        temperature: data.main.temp,
        windDirection: data.wind.deg,
        windSpeed: data.wind.speed,
        cloudDensity: data.clouds.all,
        precipitationType: this.determinePrecipitationType(data.weather[0].id),
        pressure: data.main.pressure,
        humidity: data.main.humidity,
        visibility: data.visibility / 1000, // Convert meters to kilometers
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error fetching weather data:", error);
      throw error;
    }
  }

  /**
   * Fetches forecast weather data
   */
  static async getForecast(
    location: GeoPoint,
    days: number = 5
  ): Promise<WeatherData[]> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${
          location.latitude
        }&lon=${
          location.longitude
        }&appid=${OPENWEATHER_API_KEY}&units=metric&cnt=${days * 8}` // 8 forecasts per day
      );

      if (!response.ok) {
        throw new Error("Failed to fetch forecast data");
      }

      const data = await response.json();

      return data.list.map((item: any) => ({
        temperature: item.main.temp,
        windDirection: item.wind.deg,
        windSpeed: item.wind.speed,
        cloudDensity: item.clouds.all,
        precipitationType: this.determinePrecipitationType(item.weather[0].id),
        pressure: item.main.pressure,
        humidity: item.main.humidity,
        visibility: item.visibility / 1000,
        timestamp: new Date(item.dt * 1000),
      }));
    } catch (error) {
      console.error("Error fetching forecast data:", error);
      throw error;
    }
  }

  /**
   * Fetches Korean weather data from KMA (기상청)
   */
  static async getKoreanWeatherData(location: GeoPoint): Promise<WeatherData> {
    try {
      // This would be replaced with actual KMA API implementation
      // Currently using a mock implementation

      // Mock data
      return {
        temperature: 22,
        windDirection: 180,
        windSpeed: 5.5,
        cloudDensity: 40,
        precipitationType: "none",
        pressure: 1013,
        humidity: 65,
        visibility: 10,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error fetching Korean weather data:", error);
      throw error;
    }
  }

  /**
   * Gets disaster warnings for the area
   */
  static async getDisasterWarnings(
    location: GeoPoint
  ): Promise<DisasterWarning[]> {
    try {
      // This would be integrated with actual disaster warning API
      // Currently returning mock data

      // Check if any active warnings in the area (mock implementation)
      const hasActiveWarnings = Math.random() > 0.7;

      if (!hasActiveWarnings) {
        return [];
      }

      // Mock disaster warning
      return [
        {
          type: "typhoon",
          severity: "high",
          predictedPath: [
            { latitude: location.latitude, longitude: location.longitude },
            {
              latitude: location.latitude + 0.2,
              longitude: location.longitude + 0.3,
            },
            {
              latitude: location.latitude + 0.5,
              longitude: location.longitude + 0.7,
            },
          ],
          estimatedArrivalTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
          estimatedIntensity: 85, // wind speed in km/h
          safetyInstructions:
            "안전한 항구로 대피하십시오. 높은 파도와 강한 바람이 예상됩니다.",
        },
      ];
    } catch (error) {
      console.error("Error fetching disaster warnings:", error);
      return [];
    }
  }

  /**
   * Helper method to determine precipitation type based on weather condition ID
   */
  private static determinePrecipitationType(
    conditionId: number
  ): "rain" | "snow" | "hail" | "none" {
    // Based on OpenWeatherMap condition codes
    if (conditionId >= 200 && conditionId < 300) return "hail"; // Thunderstorm
    if (conditionId >= 300 && conditionId < 600) return "rain"; // Drizzle and Rain
    if (conditionId >= 600 && conditionId < 700) return "snow"; // Snow
    return "none";
  }
}
