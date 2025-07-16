import { apiClient } from './config';
import { EarthVisualizationResponse } from '../../models/EarthTypes';

export const EarthApi = {
  /**
   * 위도와 경도를 기반으로 지구 시각화 데이터를 가져옵니다.
   * @param lat 위도
   * @param lon 경도
   * @returns Promise<EarthVisualizationResponse>
   */
  getVisualizationData: async (lat: number, lon: number): Promise<EarthVisualizationResponse> => {
    try {
      const response = await apiClient.get<EarthVisualizationResponse>('/earth', {
        params: {
          lat,
          lon,
        },
      });
      return response.data;
    } catch (error) {
      console.error('지구 시각화 데이터 조회 실패:', error);
      throw error;
    }
  },
}; 