import { apiClient } from './config';
import { WeatherResponse, CurrentWeatherResponse } from '../../models/WeatherTypes';

export const WeatherApi = {
  /**
   * 위도와 경도를 기반으로 날씨 예보 데이터를 가져옵니다.
   * @param lat 위도
   * @param lon 경도
   * @returns Promise<WeatherResponse>
   */
  getForecast: async (lat: number, lon: number): Promise<WeatherResponse> => {
    try {
      const response = await apiClient.get<WeatherResponse>('/weather', {
        params: {
          lat,
          lon,
        },
      });
      return response.data;
    } catch (error) {
      console.error('날씨 데이터 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 위도와 경도를 기반으로 현재 날씨 데이터를 가져옵니다.
   * @param lat 위도
   * @param lon 경도
   * @returns Promise<CurrentWeatherResponse>
   */
  getCurrentWeather: async (lat: number, lon: number): Promise<CurrentWeatherResponse> => {
    try {
      const response = await apiClient.get<CurrentWeatherResponse>('/current', {
        params: {
          lat,
          lon,
        },
      });
      return response.data;
    } catch (error) {
      console.error('현재 날씨 데이터 조회 실패:', error);
      throw error;
    }
  },
}; 