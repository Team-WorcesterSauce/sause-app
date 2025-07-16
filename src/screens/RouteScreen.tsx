import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NavigationService } from "../services/NavigationService";
import { getLocation } from "../services/LocationService";
import { GeoPoint, RouteRecommendation } from "../models/types";
import { formatDate } from "../utils/GeoUtils";

/**
 * 항해 경로 추천 화면
 */
const RouteScreen: React.FC = () => {
  const [startLocation, setStartLocation] = useState<string>("");
  const [endLocation, setEndLocation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [route, setRoute] = useState<RouteRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 현재 위치를 출발지로 설정
  const useCurrentLocationAsStart = async () => {
    try {
      setLoading(true);
      const location = await getLocation();
      setStartLocation(
        `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert(
        "위치 오류",
        "현재 위치를 가져올 수 없습니다. GPS 설정을 확인해 주세요."
      );
    }
  };

  // 텍스트 좌표를 GeoPoint로 변환
  const parseLocationInput = (input: string): GeoPoint | null => {
    try {
      const [lat, lng] = input
        .split(",")
        .map((part) => parseFloat(part.trim()));

      if (isNaN(lat) || isNaN(lng)) {
        return null;
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return null;
      }

      return { latitude: lat, longitude: lng };
    } catch (error) {
      return null;
    }
  };

  // 경로 검색
  const findRoute = async () => {
    setError(null);

    const start = parseLocationInput(startLocation);
    const end = parseLocationInput(endLocation);

    if (!start) {
      setError(
        '출발지 좌표 형식이 올바르지 않습니다. "위도, 경도" 형식으로 입력하세요.'
      );
      return;
    }

    if (!end) {
      setError(
        '목적지 좌표 형식이 올바르지 않습니다. "위도, 경도" 형식으로 입력하세요.'
      );
      return;
    }

    try {
      setLoading(true);
      const recommendation = await NavigationService.getRecommendedRoute(
        start,
        end
      );
      setRoute(recommendation);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("경로를 계산하는 중 오류가 발생했습니다.");
      console.error("경로 계산 오류:", error);
    }
  };

  // 안전도 표시 컬러
  const getSafetyColor = (score: number): string => {
    if (score >= 80) return "#4CAF50"; // 안전 - 녹색
    if (score >= 60) return "#FFEB3B"; // 주의 - 노랑
    if (score >= 40) return "#FF9800"; // 경고 - 주황
    return "#F44336"; // 위험 - 빨강
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>항해 경로 추천</Text>
        <Text style={styles.headerSubtitle}>안전한 항로를 찾아드립니다</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputSection}>
          <Text style={styles.label}>출발지 (위도, 경도)</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={startLocation}
              onChangeText={setStartLocation}
              placeholder="예: 37.5665, 126.9780"
              placeholderTextColor="#BBDEFB"
              keyboardType="numbers-and-punctuation"
            />
            <TouchableOpacity
              style={styles.locationButton}
              onPress={useCurrentLocationAsStart}
            >
              <Feather name="navigation" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>목적지 (위도, 경도)</Text>
          <TextInput
            style={styles.input}
            value={endLocation}
            onChangeText={setEndLocation}
            placeholder="예: 35.1796, 129.0756"
            placeholderTextColor="#BBDEFB"
            keyboardType="numbers-and-punctuation"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={styles.findButton}
            onPress={findRoute}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="search" size={20} color="#FFFFFF" />
                <Text style={styles.findButtonText}>경로 찾기</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {route && (
          <View style={styles.routeResult}>
            <Text style={styles.resultTitle}>추천 경로</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Feather name="map-pin" size={20} color="#BBDEFB" />
                <Text style={styles.infoLabel}>총 거리</Text>
                <Text style={styles.infoValue}>
                  {route.distance.toFixed(1)} km
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Feather name="clock" size={20} color="#BBDEFB" />
                <Text style={styles.infoLabel}>예상 소요 시간</Text>
                <Text style={styles.infoValue}>
                  {Math.round(route.estimatedTravelTime / 60)} 시간
                </Text>
              </View>
            </View>

            <View style={styles.safetyContainer}>
              <Text style={styles.safetyLabel}>안전도</Text>
              <View style={styles.safetyBarContainer}>
                <View
                  style={[
                    styles.safetyBar,
                    {
                      width: `${route.safetyScore}%`,
                      backgroundColor: getSafetyColor(route.safetyScore),
                    },
                  ]}
                />
              </View>
              <Text style={styles.safetyScore}>{route.safetyScore}/100</Text>
            </View>

            <Text style={styles.waypointsTitle}>경유지</Text>
            {route.waypoints.map((point, index) => (
              <View key={index} style={styles.waypoint}>
                <View style={styles.waypointDot} />
                <Text style={styles.waypointText}>
                  {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                </Text>
              </View>
            ))}

            <Text style={styles.weatherTitle}>예상 날씨 정보</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.weatherScroll}
            >
              {route.weatherConditionsOnRoute.map((item, index) => (
                <View key={index} style={styles.weatherItem}>
                  <Text style={styles.weatherLocation}>경유지 {index + 1}</Text>
                  <View style={styles.weatherData}>
                    <View style={styles.weatherDataRow}>
                      <Feather name="thermometer" size={16} color="#BBDEFB" />
                      <Text style={styles.weatherDataText}>
                        {item.weather.temperature.toFixed(1)}°C
                      </Text>
                    </View>
                    <View style={styles.weatherDataRow}>
                      <Feather name="wind" size={16} color="#BBDEFB" />
                      <Text style={styles.weatherDataText}>
                        {item.weather.windSpeed} m/s
                      </Text>
                    </View>
                    <View style={styles.weatherDataRow}>
                      <Feather name="cloud" size={16} color="#BBDEFB" />
                      <Text style={styles.weatherDataText}>
                        {item.weather.cloudDensity}%
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton}>
                <Feather name="download" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>경로 저장</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Feather name="navigation" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>항해 시작</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.disclaimer}>
        <Feather name="info" size={16} color="#BBDEFB" />
        <Text style={styles.disclaimerText}>
          경로 추천 시스템은 현재 데모 버전이며, 실제 항해에 사용하기 전에
          전문가의 검토가 필요합니다.
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#BBDEFB",
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputSection: {
    backgroundColor: "rgba(25, 118, 210, 0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  locationButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(25, 118, 210, 0.6)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  errorText: {
    color: "#FF6B6B",
    marginBottom: 16,
  },
  findButton: {
    backgroundColor: "#1976D2",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  findButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  routeResult: {
    backgroundColor: "rgba(25, 118, 210, 0.2)",
    borderRadius: 12,
    padding: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: "#BBDEFB",
    marginTop: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 4,
  },
  safetyContainer: {
    marginBottom: 20,
  },
  safetyLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  safetyBarContainer: {
    height: 12,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 6,
    overflow: "hidden",
  },
  safetyBar: {
    height: "100%",
  },
  safetyScore: {
    fontSize: 14,
    color: "#FFFFFF",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  waypointsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  waypoint: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  waypointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1976D2",
    marginRight: 8,
  },
  waypointText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 20,
    marginBottom: 12,
  },
  weatherScroll: {
    marginBottom: 20,
  },
  weatherItem: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 120,
  },
  weatherLocation: {
    fontSize: 14,
    color: "#BBDEFB",
    marginBottom: 8,
  },
  weatherData: {
    gap: 4,
  },
  weatherDataRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  weatherDataText: {
    color: "#FFFFFF",
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "rgba(25, 118, 210, 0.6)",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
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
export default RouteScreen;

