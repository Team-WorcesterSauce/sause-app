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
  Dimensions,
  Platform,
  Image,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NavigationService } from "../services/NavigationService";
import { getLocation } from "../services/LocationService";
import { GeoPoint, RouteRecommendation } from "../models/types";

const { width, height } = Dimensions.get("window");

const isMobile = Platform.OS === "android" || Platform.OS === "ios";

/**
 * 경유지들을 기반으로 지도의 초기 영역을 계산
 */
const getInitialRegion = (waypoints: GeoPoint[]) => {
  if (waypoints.length === 0) {
    return {
      latitude: 37.5665,
      longitude: 126.978,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  }

  const latitudes = waypoints.map((point) => point.latitude);
  const longitudes = waypoints.map((point) => point.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  const latDelta = Math.max(maxLat - minLat, 0.01) * 1.3; // 여유 공간 추가
  const lngDelta = Math.max(maxLng - minLng, 0.01) * 1.3;

  return {
    latitude: centerLat,
    longitude: centerLng,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
};

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

  // 이미지 기반 지도 컴포넌트
  const ImageMapView = ({ route }: { route: RouteRecommendation }) => {
    // 좌표를 이미지 상의 픽셀 위치로 변환
    const coordinateToPixel = (lat: number, lng: number) => {
      // 지구 전체를 기준으로 한 정규화된 좌표 계산
      const mapWidth = width - 32; // 좌우 패딩 16px씩
      const mapHeight = 250; // 지도 높이 250px 기준
      const x = ((lng + 180) / 360) * mapWidth;
      const y = ((90 - lat) / 180) * mapHeight;
      return { x, y };
    };

    // 두 점 사이의 거리와 각도 계산
    const calculateLineSegments = (points: GeoPoint[]) => {
      const segments = [];
      for (let i = 0; i < points.length - 1; i++) {
        const start = coordinateToPixel(
          points[i].latitude,
          points[i].longitude
        );
        const end = coordinateToPixel(
          points[i + 1].latitude,
          points[i + 1].longitude
        );

        const distance = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );

        const angle =
          Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);

        segments.push({
          left: start.x,
          top: start.y,
          width: distance,
          angle: angle,
        });
      }
      return segments;
    };

    const lineSegments = calculateLineSegments(route.waypoints);

    return (
      <View style={styles.imageMapContainer}>
        <Image
          source={require("../../assets/images/earth-texture.jpg")}
          style={styles.earthImage}
          resizeMode="cover"
        />

        {/* 경로 선 표시 */}
        {lineSegments.map((segment, index) => (
          <View
            key={`line-${index}`}
            style={[
              styles.routeLine,
              {
                left: Math.max(0, Math.min(segment.left, width - 32)),
                top: Math.max(0, Math.min(segment.top, 250)),
                width: Math.min(segment.width, width - 32 - segment.left),
                transform: [{ rotate: `${segment.angle}deg` }],
              },
            ]}
          />
        ))}

        {/* 경유지 마커들 */}
        {route.waypoints.map((point, index) => {
          const isStart = index === 0;
          const isEnd = index === route.waypoints.length - 1;
          const pixelPosition = coordinateToPixel(
            point.latitude,
            point.longitude
          );

          return (
            <View
              key={index}
              style={[
                styles.marker,
                {
                  left: Math.max(
                    0,
                    Math.min(pixelPosition.x - 10, width - 32 - 20)
                  ),
                  top: Math.max(0, Math.min(pixelPosition.y - 10, 250 - 20)),
                  backgroundColor: isStart
                    ? "#4CAF50"
                    : isEnd
                    ? "#F44336"
                    : "#1976D2",
                },
              ]}
            >
              <Text style={styles.markerText}>
                {isStart ? "S" : isEnd ? "E" : index}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgb(14, 25, 40)" />
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

            {/* API 응답 메시지 표시 */}
            <View style={styles.messageContainer}>
              <Feather name="info" size={16} color="#BBDEFB" />
              <Text style={styles.messageText}>{route.message}</Text>
            </View>

            {/* 경로 지도 */}
            <View style={styles.mapContainer}>
              <Text style={styles.mapTitle}>경로 지도</Text>
              <ImageMapView route={route} />
            </View>

            {/* 경유지 정보 */}
            <Text style={styles.waypointsTitle}>
              경로 ({route.waypoints.length}개 지점)
            </Text>
            <ScrollView
              style={styles.waypointsContainer}
              showsVerticalScrollIndicator={false}
            >
              {route.waypoints.map((point, index) => {
                const isStart = index === 0;
                const isEnd = index === route.waypoints.length - 1;
                const label = isStart
                  ? "출발지"
                  : isEnd
                  ? "도착지"
                  : `경유지 ${index}`;

                return (
                  <View key={index} style={styles.waypoint}>
                    <View
                      style={[
                        styles.waypointDot,
                        {
                          backgroundColor: isStart
                            ? "#4CAF50"
                            : isEnd
                            ? "#F44336"
                            : "#1976D2",
                        },
                      ]}
                    />
                    <Text style={styles.waypointText}>
                      {label}: {point.latitude.toFixed(4)},{" "}
                      {point.longitude.toFixed(4)}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            {/* 경로 정보 */}
            <View style={styles.routeInfo}>
              <Text style={styles.routeInfoTitle}>경로 정보</Text>
              <Text style={styles.routeInfoText}>
                총 {route.waypoints.length}개의 경유지를 통과하는 경로입니다.
              </Text>
              <Text style={styles.routeInfoText}>
                출발지에서 목적지까지의 최적 경로를 제공합니다.
              </Text>
            </View>

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
  waypointsContainer: {
    maxHeight: 200,
    marginBottom: 16,
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
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  messageText: {
    fontSize: 14,
    color: "#BBDEFB",
    marginLeft: 8,
    flex: 1,
  },
  routeInfo: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  routeInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  routeInfoText: {
    fontSize: 14,
    color: "#BBDEFB",
    marginBottom: 4,
  },
  mapContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  map: {
    width: "100%",
    height: 250,
    borderRadius: 8,
  },
  mapPlaceholder: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: "#BBDEFB",
    textAlign: "center",
    marginTop: 12,
    fontWeight: "bold",
  },
  mapPlaceholderSubText: {
    fontSize: 14,
    color: "#BBDEFB",
    textAlign: "center",
    marginTop: 4,
    opacity: 0.7,
  },
  imageMapContainer: {
    width: "100%",
    height: 700,
    borderRadius: 8,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  earthImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    resizeMode: "contain",
  },
  marker: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  markerText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  routeLine: {
    position: "absolute",
    height: 2,
    backgroundColor: "#1976D2",
    transformOrigin: "left center",
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
