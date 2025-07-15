import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { DisasterWarning, GeoPoint } from "../models/types";
import { WeatherService } from "../services/WeatherService";
import { getLocation } from "../services/LocationService";
import { formatDate } from "../utils/GeoUtils";

/**
 * 재난 경고 화면
 */
const WarningScreen: React.FC = () => {
  const [warnings, setWarnings] = useState<DisasterWarning[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);

  // 경고 불러오기
  const loadWarnings = async () => {
    try {
      setLoading(true);
      setError(null);

      // 현재 위치 가져오기
      const location = await getLocation();
      setCurrentLocation(location);

      // 재난 경고 가져오기
      const warningData = await WeatherService.getDisasterWarnings(location);
      setWarnings(warningData);
    } catch (err) {
      console.error("재난 경고 로드 오류:", err);
      setError("재난 경고 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadWarnings();
  }, []);

  // 새로고침 처리
  const handleRefresh = () => {
    loadWarnings();
  };

  // 경고 아이콘 선택
  const getWarningIcon = (type: string) => {
    switch (type) {
      case "typhoon":
        return "wind";
      case "tornado":
        return "rotate-cw";
      case "storm":
        return "cloud-lightning";
      default:
        return "alert-triangle";
    }
  };

  // 심각도에 따른 색상
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "extreme":
        return "#F44336";
      case "high":
        return "#FF9800";
      case "medium":
        return "#FFEB3B";
      case "low":
        return "#4CAF50";
      default:
        return "#FFFFFF";
    }
  };

  // 심각도 텍스트
  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "extreme":
        return "극심";
      case "high":
        return "높음";
      case "medium":
        return "중간";
      case "low":
        return "낮음";
      default:
        return "알 수 없음";
    }
  };

  // 경고 상세 정보 보기
  const viewWarningDetails = (warning: DisasterWarning) => {
    Alert.alert(
      `${
        warning.type === "typhoon"
          ? "태풍"
          : warning.type === "tornado"
          ? "토네이도"
          : "폭풍"
      } 경고`,
      `심각도: ${getSeverityText(
        warning.severity
      )}\n예상 도달 시간: ${formatDate(
        warning.estimatedArrivalTime
      )}\n예상 강도: ${warning.estimatedIntensity} km/h\n\n안전 지침: ${
        warning.safetyInstructions
      }`,
      [{ text: "확인", style: "default" }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>경고 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>재난 경고</Text>
        {currentLocation && (
          <Text style={styles.locationText}>
            현재 위치: {currentLocation.latitude.toFixed(4)}°N,{" "}
            {currentLocation.longitude.toFixed(4)}°E
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Feather name="refresh-cw" size={16} color="#FFFFFF" />
        <Text style={styles.refreshText}>새로고침</Text>
      </TouchableOpacity>

      {error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={50} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : warnings.length === 0 ? (
        <View style={styles.noWarningsContainer}>
          <Feather name="check-circle" size={50} color="#4CAF50" />
          <Text style={styles.noWarningsText}>
            현재 활성화된 경고가 없습니다
          </Text>
        </View>
      ) : (
        <FlatList
          data={warnings}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.warningCard}
              onPress={() => viewWarningDetails(item)}
            >
              <View
                style={[
                  styles.warningIcon,
                  { backgroundColor: getSeverityColor(item.severity) },
                ]}
              >
                <Feather
                  name={getWarningIcon(item.type)}
                  size={24}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.warningContent}>
                <View style={styles.warningHeader}>
                  <Text style={styles.warningType}>
                    {item.type === "typhoon"
                      ? "태풍"
                      : item.type === "tornado"
                      ? "토네이도"
                      : "폭풍"}
                  </Text>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityColor(item.severity) },
                    ]}
                  >
                    <Text style={styles.severityText}>
                      {getSeverityText(item.severity)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.arrivalTime}>
                  예상 도달: {formatDate(item.estimatedArrivalTime)}
                </Text>

                <Text style={styles.intensityText}>
                  예상 강도: {item.estimatedIntensity} km/h
                </Text>

                <Text numberOfLines={2} style={styles.safetyText}>
                  {item.safetyInstructions}
                </Text>

                <View style={styles.viewDetails}>
                  <Text style={styles.viewDetailsText}>자세히 보기</Text>
                  <Feather name="chevron-right" size={16} color="#4A90E2" />
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.warningsList}
        />
      )}

      <View style={styles.disclaimer}>
        <Feather name="info" size={16} color="#BBDEFB" />
        <Text style={styles.disclaimerText}>
          경고 알림은 30분마다 자동으로 업데이트되며, 심각한 위험이 감지되면
          즉시 알림이 발송됩니다.
        </Text>
      </View>
    </View>
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
  locationText: {
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
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    padding: 12,
    margin: 16,
    backgroundColor: "rgba(25, 118, 210, 0.6)",
    borderRadius: 8,
  },
  refreshText: {
    color: "#FFFFFF",
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: "#FF6B6B",
    fontSize: 16,
    textAlign: "center",
  },
  noWarningsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noWarningsText: {
    marginTop: 16,
    color: "#4CAF50",
    fontSize: 16,
    textAlign: "center",
  },
  warningsList: {
    padding: 16,
  },
  warningCard: {
    backgroundColor: "rgba(25, 118, 210, 0.2)",
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    overflow: "hidden",
  },
  warningIcon: {
    width: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  warningContent: {
    flex: 1,
    padding: 16,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  warningType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  arrivalTime: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  intensityText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  safetyText: {
    fontSize: 14,
    color: "#BBDEFB",
    marginBottom: 12,
  },
  viewDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewDetailsText: {
    fontSize: 14,
    color: "#4A90E2",
    marginRight: 4,
  },
  disclaimer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "flex-start",
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: "#BBDEFB",
    marginLeft: 8,
  },
});

export default WarningScreen;
