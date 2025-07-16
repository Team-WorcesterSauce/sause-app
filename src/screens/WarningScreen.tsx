import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { DisasterPrediction, GeoPoint } from "../models/types";
import { DisasterService } from "../services/DisasterService";
import { getLocation } from "../services/LocationService";

/**
 * 재난 경고 화면
 */
const WarningScreen: React.FC = () => {
  const [prediction, setPrediction] = useState<DisasterPrediction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // 재난 예측 정보 불러오기
  const loadDisasterPrediction = async () => {
    try {
      setLoading(true);
      setError(null);

      // 현재 위치 가져오기
      const location = await getLocation();
      setCurrentLocation(location);

      // 재난 예측 정보 가져오기
      const predictionData = await DisasterService.getDisasterPrediction(
        location
      );
      setPrediction(predictionData);
    } catch (err) {
      console.error("재난 예측 정보 로드 오류:", err);
      setError("재난 예측 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 새로고침 처리
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDisasterPrediction();
    setRefreshing(false);
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadDisasterPrediction();
  }, []);

  // 예측 결과에 따른 색상
  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case "안전":
        return "#4CAF50";
      case "주의":
        return "#FFEB3B";
      case "경고":
        return "#FF9800";
      case "위험":
        return "#F44336";
      default:
        return "#FFFFFF";
    }
  };

  // 예측 결과에 따른 아이콘
  const getPredictionIcon = (prediction: string) => {
    switch (prediction) {
      case "안전":
        return "check-circle";
      case "주의":
        return "info";
      case "경고":
        return "alert-triangle";
      case "위험":
        return "alert-circle";
      default:
        return "help-circle";
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="rgb(14, 25, 40)" />
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>재난 예측 정보를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="rgb(14, 25, 40)" />
        <Feather name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadDisasterPrediction}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgb(14, 25, 40)" />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>재난 경고</Text>
          <Text style={styles.headerSubtitle}>
            현재 위치의 재난 위험도를 확인하세요
          </Text>
        </View>

        {currentLocation && (
          <View style={styles.locationInfo}>
            <Feather name="map-pin" size={16} color="#BBDEFB" />
            <Text style={styles.locationText}>
              현재 위치: {currentLocation.latitude.toFixed(4)},{" "}
              {currentLocation.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        {prediction && (
          <View style={styles.predictionContainer}>
            <View style={styles.predictionHeader}>
              <View
                style={[
                  styles.predictionIcon,
                  {
                    backgroundColor: getPredictionColor(prediction.prediction),
                  },
                ]}
              >
                <Feather
                  name={getPredictionIcon(prediction.prediction)}
                  size={32}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.predictionInfo}>
                <Text style={styles.predictionTitle}>현재 상태</Text>
                <Text
                  style={[
                    styles.predictionLevel,
                    { color: getPredictionColor(prediction.prediction) },
                  ]}
                >
                  {prediction.prediction}
                </Text>
              </View>
            </View>

            <View style={styles.messageContainer}>
              <Text style={styles.messageTitle}>상세 정보</Text>
              <Text style={styles.messageText}>{prediction.message}</Text>
            </View>

            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleRefresh}
              >
                <Feather name="refresh-cw" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>새로고침</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.safetyTips}>
          <Text style={styles.safetyTipsTitle}>안전 수칙</Text>
          <View style={styles.safetyTip}>
            <Feather name="check" size={16} color="#4CAF50" />
            <Text style={styles.safetyTipText}>
              기상 정보를 정기적으로 확인하세요
            </Text>
          </View>
          <View style={styles.safetyTip}>
            <Feather name="check" size={16} color="#4CAF50" />
            <Text style={styles.safetyTipText}>
              안전 장비를 항상 점검하세요
            </Text>
          </View>
          <View style={styles.safetyTip}>
            <Feather name="check" size={16} color="#4CAF50" />
            <Text style={styles.safetyTipText}>
              위험 징후 발견 시 즉시 대피하세요
            </Text>
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Feather name="info" size={16} color="#BBDEFB" />
          <Text style={styles.disclaimerText}>
            재난 예측 정보는 참고용이며, 실제 항해 시에는 전문가의 조언을
            구하시기 바랍니다.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1929",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(187, 222, 251, 0.2)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#BBDEFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#FFFFFF",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: "#F44336",
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#1976D2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(25, 118, 210, 0.1)",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#BBDEFB",
    marginLeft: 8,
  },
  predictionContainer: {
    margin: 16,
    backgroundColor: "rgba(25, 118, 210, 0.2)",
    borderRadius: 12,
    padding: 16,
  },
  predictionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  predictionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  predictionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  predictionTitle: {
    fontSize: 16,
    color: "#BBDEFB",
    marginBottom: 4,
  },
  predictionLevel: {
    fontSize: 24,
    fontWeight: "bold",
  },
  messageContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: "#BBDEFB",
    lineHeight: 20,
  },
  actionContainer: {
    alignItems: "center",
  },
  actionButton: {
    backgroundColor: "#1976D2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  safetyTips: {
    margin: 16,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 12,
    padding: 16,
  },
  safetyTipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  safetyTip: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  safetyTipText: {
    fontSize: 14,
    color: "#BBDEFB",
    marginLeft: 8,
  },
  disclaimer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "flex-start",
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: "#BBDEFB",
    marginLeft: 8,
    lineHeight: 16,
  },
});

export default WarningScreen;
