import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CachedData,
  WeatherData,
  DisasterWarning,
  GeoPoint,
  RouteRecommendation,
} from "../models/types";

/**
 * 스토리지 서비스: 로컬 저장소와 캐싱 처리를 담당
 */
export class StorageService {
  // 저장소 키 접두사
  private static readonly WEATHER_CACHE_PREFIX = "weather_cache_";
  private static readonly DISASTER_WARNING_KEY = "disaster_warnings";
  private static readonly ROUTE_CACHE_PREFIX = "route_cache_";
  private static readonly USER_PREFERENCES_KEY = "user_preferences";

  /**
   * 날씨 데이터를 캐시에 저장
   */
  static async cacheWeatherData(
    location: GeoPoint,
    weatherData: WeatherData[],
    expiryMinutes: number = 60
  ): Promise<void> {
    try {
      const now = Date.now();
      const expiresAt = now + expiryMinutes * 60 * 1000;

      const key = this.getWeatherCacheKey(location);
      const data: CachedData = {
        weatherData,
        timestamp: new Date(now),
        expiresAt: new Date(expiresAt),
      };

      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("날씨 데이터 캐싱 오류:", error);
      throw error;
    }
  }

  /**
   * 캐시된 날씨 데이터 조회 (만료되지 않은 경우)
   */
  static async getCachedWeatherData(
    location: GeoPoint
  ): Promise<CachedData | null> {
    try {
      const key = this.getWeatherCacheKey(location);
      const data = await AsyncStorage.getItem(key);

      if (!data) return null;

      const cachedData: CachedData = JSON.parse(data);

      // ISO 문자열을 Date 객체로 변환
      cachedData.timestamp = new Date(cachedData.timestamp);
      cachedData.expiresAt = new Date(cachedData.expiresAt);

      // 만료된 데이터인지 확인
      if (cachedData.expiresAt.getTime() < Date.now()) {
        await AsyncStorage.removeItem(key); // 만료된 데이터 삭제
        return null;
      }

      return cachedData;
    } catch (error) {
      console.error("날씨 데이터 조회 오류:", error);
      return null;
    }
  }

  /**
   * 재난 경고 데이터를 캐시에 저장
   */
  static async cacheDisasterWarnings(
    warnings: DisasterWarning[]
  ): Promise<void> {
    try {
      const data = {
        warnings,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(
        this.DISASTER_WARNING_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error("재난 경고 캐싱 오류:", error);
      throw error;
    }
  }

  /**
   * 캐시된 재난 경고 조회
   */
  static async getCachedDisasterWarnings(): Promise<DisasterWarning[] | null> {
    try {
      const data = await AsyncStorage.getItem(this.DISASTER_WARNING_KEY);

      if (!data) return null;

      const parsedData = JSON.parse(data);
      return parsedData.warnings;
    } catch (error) {
      console.error("재난 경고 조회 오류:", error);
      return null;
    }
  }

  /**
   * 경로 추천 정보를 캐시에 저장
   */
  static async cacheRouteRecommendation(
    startPoint: GeoPoint,
    endPoint: GeoPoint,
    route: RouteRecommendation,
    expiryMinutes: number = 60
  ): Promise<void> {
    try {
      const now = Date.now();
      const expiresAt = now + expiryMinutes * 60 * 1000;

      const key = this.getRouteCacheKey(startPoint, endPoint);
      const data = {
        route,
        timestamp: now,
        expiresAt,
      };

      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("경로 추천 캐싱 오류:", error);
      throw error;
    }
  }

  /**
   * 캐시된 경로 추천 정보 조회
   */
  static async getCachedRouteRecommendation(
    startPoint: GeoPoint,
    endPoint: GeoPoint
  ): Promise<RouteRecommendation | null> {
    try {
      const key = this.getRouteCacheKey(startPoint, endPoint);
      const data = await AsyncStorage.getItem(key);

      if (!data) return null;

      const parsedData = JSON.parse(data);

      // 만료된 데이터인지 확인
      if (parsedData.expiresAt < Date.now()) {
        await AsyncStorage.removeItem(key); // 만료된 데이터 삭제
        return null;
      }

      return parsedData.route;
    } catch (error) {
      console.error("경로 추천 조회 오류:", error);
      return null;
    }
  }

  /**
   * 사용자 설정 저장
   */
  static async saveUserPreferences(preferences: any): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.USER_PREFERENCES_KEY,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error("사용자 설정 저장 오류:", error);
      throw error;
    }
  }

  /**
   * 사용자 설정 조회
   */
  static async getUserPreferences(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(this.USER_PREFERENCES_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("사용자 설정 조회 오류:", error);
      return null;
    }
  }

  /**
   * 만료된 모든 캐시 정리
   */
  static async cleanupExpiredCache(): Promise<void> {
    try {
      // AsyncStorage의 모든 키 가져오기
      const keys = await AsyncStorage.getAllKeys();

      // 날씨 캐시 키 필터링
      const weatherCacheKeys = keys.filter((key) =>
        key.startsWith(this.WEATHER_CACHE_PREFIX)
      );

      // 경로 캐시 키 필터링
      const routeCacheKeys = keys.filter((key) =>
        key.startsWith(this.ROUTE_CACHE_PREFIX)
      );

      // 날씨 캐시 확인 및 만료된 항목 삭제
      for (const key of weatherCacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const cachedData = JSON.parse(data);
          if (cachedData.expiresAt < Date.now()) {
            await AsyncStorage.removeItem(key);
          }
        }
      }

      // 경로 캐시 확인 및 만료된 항목 삭제
      for (const key of routeCacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const cachedData = JSON.parse(data);
          if (cachedData.expiresAt < Date.now()) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error("캐시 정리 오류:", error);
    }
  }

  /**
   * 위치 기반 날씨 캐시 키 생성
   */
  private static getWeatherCacheKey(location: GeoPoint): string {
    // 위도와 경도를 소수점 둘째 자리까지만 사용 (근사 위치)
    const lat = parseFloat(location.latitude.toFixed(2));
    const lng = parseFloat(location.longitude.toFixed(2));
    return `${this.WEATHER_CACHE_PREFIX}${lat}_${lng}`;
  }

  /**
   * 경로 캐시 키 생성
   */
  private static getRouteCacheKey(start: GeoPoint, end: GeoPoint): string {
    // 출발지와 목적지 좌표를 소수점 둘째 자리까지만 사용 (근사 위치)
    const startLat = parseFloat(start.latitude.toFixed(2));
    const startLng = parseFloat(start.longitude.toFixed(2));
    const endLat = parseFloat(end.latitude.toFixed(2));
    const endLng = parseFloat(end.longitude.toFixed(2));
    return `${this.ROUTE_CACHE_PREFIX}${startLat}_${startLng}_${endLat}_${endLng}`;
  }
}
