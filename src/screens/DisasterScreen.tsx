import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { DisasterApi } from '../services/api/DisasterApi';
import { getLocation } from '../services/LocationService';
import { Feather } from '@expo/vector-icons';

interface DisasterScreenProps {
  route?: {
    params?: {
      latitude?: number;
      longitude?: number;
    };
  };
}

const DisasterScreen: React.FC<DisasterScreenProps> = ({ route }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disasterInfo, setDisasterInfo] = useState<{
    prediction: string;
    message: string;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDisasterInfo = async () => {
    try {
      setError(null);
      setLoading(true);

      // 위치 정보 가져오기
      let latitude: number;
      let longitude: number;

      if (route?.params?.latitude && route?.params?.longitude) {
        latitude = route.params.latitude;
        longitude = route.params.longitude;
      } else {
        const location = await getLocation();
        latitude = location.latitude;
        longitude = location.longitude;
      }

      // 재난 정보 가져오기
      const data = await DisasterApi.getDisasterInfo(latitude, longitude);
      setDisasterInfo(data);
    } catch (err) {
      console.error('재난 정보 로드 오류:', err);
      setError('재난 정보를 불러오는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadDisasterInfo();
  }, [route?.params?.latitude, route?.params?.longitude]);

  // 새로고침 처리
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDisasterInfo();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>재난 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-triangle" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.contentContainer}>
        {/* 예측 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>재난 예측</Text>
          <View style={styles.predictionContainer}>
            <Feather
              name={disasterInfo?.prediction === '안전' ? 'check-circle' : 'alert-circle'}
              size={40}
              color={disasterInfo?.prediction === '안전' ? '#4CAF50' : '#FF6B6B'}
            />
            <Text style={[
              styles.predictionText,
              { color: disasterInfo?.prediction === '안전' ? '#4CAF50' : '#FF6B6B' }
            ]}>
              {disasterInfo?.prediction}
            </Text>
          </View>
        </View>

        {/* 상세 메시지 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>상세 정보</Text>
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{disasterInfo?.message}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  contentContainer: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 15,
  },
  predictionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  predictionText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  messageContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 15,
  },
  messageText: {
    fontSize: 16,
    color: '#2D3436',
    lineHeight: 24,
  },
});

export default DisasterScreen; 