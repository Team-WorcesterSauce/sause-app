import React from "react";
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import Globe3D from "../components/Globe3D";
import { GeoPoint } from "../models/types";

/**
 * 홈 화면 컴포넌트
 */
const HomeScreen = () => {
  // 예제 데이터: 서울 좌표
  const sampleLocation: GeoPoint = {
    latitude: 37.5665,
    longitude: 126.978,
  };

  // 예제 날씨 데이터
  const sampleWeatherPoints = [
    {
      location: { latitude: 37.5665, longitude: 126.978 },
      type: "clear" as const,
    },
    {
      location: { latitude: 35.6762, longitude: 139.6503 },
      type: "rain" as const,
    },
    {
      location: { latitude: 22.3193, longitude: 114.1694 },
      type: "cloud" as const,
    },
    {
      location: { latitude: 40.7128, longitude: -74.006 },
      type: "snow" as const,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgb(14, 25, 40)" />
      <View style={styles.header}>
        <Text style={styles.title}>해네비</Text>
        <Text style={styles.subtitle}>항해용 기상 예측 및 경고 시스템</Text>
      </View>

      <View style={styles.globeContainer}>
        <Globe3D
          currentLocation={sampleLocation}
          weatherPoints={sampleWeatherPoints}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          현재 위치: {sampleLocation.latitude.toFixed(4)}°N,{" "}
          {sampleLocation.longitude.toFixed(4)}°E
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(14, 25, 40)",
  },
  header: {
    padding: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
  },
  globeContainer: {
    flex: 1,
  },
  footer: {
    padding: 16,
    backgroundColor: "rgba(14, 25, 40, 0.9)",
  },
  footerText: {
    color: "#fff",
    textAlign: "center",
  },
});

export default HomeScreen;
