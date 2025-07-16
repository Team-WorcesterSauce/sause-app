import { apiClient } from './config';
import { DisasterResponse } from '../../models/DisasterTypes';

export const DisasterApi = {
  /**
   * 위도와 경도를 기반으로 재난 예측 정보를 가져옵니다.
   * @param lat 위도
   * @param lon 경도
   * @returns Promise<DisasterResponse>
   */
  getDisasterInfo: async (lat: number, lon: number): Promise<DisasterResponse> => {
    try {
      const response = await apiClient.get<DisasterResponse>('/disaster', {
        params: {
          lat,
          lon,
        },
      });
      return response.data;
    } catch (error) {
      console.error('재난 정보 조회 실패:', error);
      throw error;
    }
  },
}; 