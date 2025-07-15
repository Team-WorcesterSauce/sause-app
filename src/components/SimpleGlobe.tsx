import React from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import { GeoPoint } from "../models/types";

interface SimpleGlobeProps {
  currentLocation?: GeoPoint;
  weatherPoints?: Array<{
    location: GeoPoint;
    type: "rain" | "snow" | "hail" | "clear" | "cloud";
  }>;
}

/**
 * 간단한 2D 지구본 대체 컴포넌트
 */
const SimpleGlobe: React.FC<SimpleGlobeProps> = ({
  currentLocation,
  weatherPoints,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.globe}>
        <Text style={styles.title}>🌍 지구본</Text>
        {currentLocation && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              현재 위치: {currentLocation.latitude.toFixed(2)},{" "}
              {currentLocation.longitude.toFixed(2)}
            </Text>
          </View>
        )}
        {weatherPoints && weatherPoints.length > 0 && (
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherTitle}>날씨 정보</Text>
            {weatherPoints.map((point, index) => (
              <Text key={index} style={styles.weatherPoint}>
                {getWeatherIcon(point.type)}{" "}
                {point.location.latitude.toFixed(1)},{" "}
                {point.location.longitude.toFixed(1)}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const getWeatherIcon = (type: string) => {
  switch (type) {
    case "rain":
      return "🌧️";
    case "snow":
      return "❄️";
    case "hail":
      return "🌨️";
    case "clear":
      return "☀️";
    case "cloud":
      return "☁️";
    default:
      return "🌤️";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(14, 25, 40)",
    justifyContent: "center",
    alignItems: "center",
  },
  globe: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 20,
    width: Dimensions.get("window").width * 0.8,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  locationInfo: {
    marginBottom: 15,
  },
  locationText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
  },
  weatherInfo: {
    width: "100%",
  },
  weatherTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  weatherPoint: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 5,
    textAlign: "center",
  },
});

export default SimpleGlobe;
