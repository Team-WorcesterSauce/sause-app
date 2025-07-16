import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { GeoPoint } from "../models/types";
import { WeatherResponse, CurrentWeatherResponse } from "../models/WeatherTypes";
import { WeatherApi } from "../services/api/WeatherApi";
import { getLocation } from "../services/LocationService";
import { getWindDirectionText, getTemperatureColor } from "../utils/GeoUtils";
import { Feather } from "@expo/vector-icons";

interface WeatherScreenProps {
  route?: {
    params?: {
      location?: GeoPoint;
    };
  };
}

/**
 * 날씨 상세 정보 화면
 */
const WeatherScreen: React.FC<WeatherScreenProps> = ({ route }) => {
  const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherResponse | null>(null);
  const [forecastData, setForecastData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 위치 및 날씨 데이터 로드
  useEffect(() => {
    const loadLocationAndWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. 위치 정보 가져오기 (전달된 위치 또는 현재 위치)
        let location: GeoPoint;

        if (route?.params?.location) {
          location = route.params.location;
        } else {
          location = await getLocation();
        }

        setCurrentLocation(location);

        // 2. 현재 날씨와 예보 데이터 가져오기
        const [current, forecast] = await Promise.all([
          WeatherApi.getCurrentWeather(location.latitude, location.longitude),
          WeatherApi.getForecast(location.latitude, location.longitude),
        ]);

        setCurrentWeather(current);
        setForecastData(forecast);
      } catch (err) {
        console.error("날씨 정보 로드 오류:", err);
        setError(
          "날씨 정보를 불러오는데 실패했습니다. 인터넷 연결을 확인하세요."
        );
      } finally {
        setLoading(false);
      }
    };

    loadLocationAndWeather();
  }, [route?.params?.location]);

  // 날씨 아이콘 선택
  const getWeatherIcon = (type: string) => {
    switch (type) {
      case "rain":
        return "cloud-rain";
      case "snow":
        return "cloud-snow";
      case "thunderstorm":
      case "drizzle":
        return "cloud-drizzle";
      case "clear":
        return "sun";
      case "clouds":
        return "cloud";
      default:
        return "cloud";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>날씨 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-triangle" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!currentWeather || !forecastData) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* 현재 위치 헤더 */}
      <View style={styles.locationHeader}>
        <Text style={styles.locationText}>
          {currentWeather.name}, {currentWeather.sys.country}
        </Text>
        <Text style={styles.updateTime}>
          업데이트: {new Date(currentWeather.dt * 1000).toLocaleTimeString()}
        </Text>
      </View>

      {/* 현재 날씨 정보 */}
      <View style={styles.currentWeatherContainer}>
        <View style={styles.currentWeatherHeader}>
          <Feather
            name={getWeatherIcon(currentWeather.weather[0].main.toLowerCase())}
            size={80}
            color="#FFF"
          />
          <Text style={styles.temperatureText}>
            {currentWeather.main.temp.toFixed(1)}°C
          </Text>
          <Text style={styles.weatherDescription}>
            {currentWeather.weather[0].description}
          </Text>
        </View>

        <View style={styles.weatherDetailsGrid}>
          <View style={styles.weatherDetail}>
            <Feather name="wind" size={24} color="#BBDEFB" />
            <Text style={styles.weatherDetailTitle}>풍속</Text>
            <Text style={styles.weatherDetailValue}>
              {currentWeather.wind.speed} m/s
            </Text>
          </View>

          <View style={styles.weatherDetail}>
            <Feather name="compass" size={24} color="#BBDEFB" />
            <Text style={styles.weatherDetailTitle}>풍향</Text>
            <Text style={styles.weatherDetailValue}>
              {getWindDirectionText(currentWeather.wind.deg)}
            </Text>
          </View>

          <View style={styles.weatherDetail}>
            <Feather name="cloud" size={24} color="#BBDEFB" />
            <Text style={styles.weatherDetailTitle}>구름</Text>
            <Text style={styles.weatherDetailValue}>
              {currentWeather.clouds.all}%
            </Text>
          </View>

          <View style={styles.weatherDetail}>
            <Feather name="droplet" size={24} color="#BBDEFB" />
            <Text style={styles.weatherDetailTitle}>습도</Text>
            <Text style={styles.weatherDetailValue}>
              {currentWeather.main.humidity}%
            </Text>
          </View>

          <View style={styles.weatherDetail}>
            <Feather name="activity" size={24} color="#BBDEFB" />
            <Text style={styles.weatherDetailTitle}>기압</Text>
            <Text style={styles.weatherDetailValue}>
              {currentWeather.main.pressure} hPa
            </Text>
          </View>

          <View style={styles.weatherDetail}>
            <Feather name="sun" size={24} color="#BBDEFB" />
            <Text style={styles.weatherDetailTitle}>일출/일몰</Text>
            <Text style={styles.weatherDetailValue}>
              {new Date(currentWeather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {' / '}
              {new Date(currentWeather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      </View>

      {/* 일기 예보 */}
      <View style={styles.forecastContainer}>
        <Text style={styles.sectionTitle}>일기 예보</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {forecastData.list.slice(1, 9).map((item, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={styles.forecastTime}>
                {new Date(item.dt * 1000).getHours()}:00
              </Text>
              <Feather
                name={getWeatherIcon(item.weather[0].main.toLowerCase())}
                size={30}
                color="#FFF"
              />
              <Text
                style={[
                  styles.forecastTemp,
                  { color: getTemperatureColor(item.main.temp) },
                ]}
              >
                {item.main.temp.toFixed(1)}°C
              </Text>
              <View style={styles.forecastWind}>
                <Feather name="wind" size={16} color="#BBDEFB" />
                <Text style={styles.forecastWindText}>
                  {item.wind.speed} m/s
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 해양 정보 */}
      <View style={styles.marineInfoContainer}>
        <Text style={styles.sectionTitle}>해양 정보</Text>

        <View style={styles.marineInfoItem}>
          <Text style={styles.marineInfoTitle}>파고</Text>
          <Text style={styles.marineInfoValue}>1.2 m</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: "30%" }]} />
          </View>
        </View>

        <View style={styles.marineInfoItem}>
          <Text style={styles.marineInfoTitle}>조류 속도</Text>
          <Text style={styles.marineInfoValue}>0.5 knots</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: "15%" }]} />
          </View>
        </View>

        <View style={styles.marineInfoItem}>
          <Text style={styles.marineInfoTitle}>해수 온도</Text>
          <Text style={styles.marineInfoValue}>18.5°C</Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: "50%", backgroundColor: "#4FC3F7" },
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Feather name="info" size={16} color="#BBDEFB" />
        <Text style={styles.disclaimerText}>
          해양 정보는 예시이며, 실제 데이터와 다를 수 있습니다.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1929",
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A1929",
  },
  loadingText: {
    marginTop: 16,
    color: "#FFF",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A1929",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: "#FF6B6B",
    fontSize: 16,
    textAlign: "center",
  },
  locationHeader: {
    marginBottom: 24,
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    color: "#FFF",
    marginBottom: 4,
  },
  updateTime: {
    fontSize: 12,
    color: "#BBDEFB",
  },
  currentWeatherContainer: {
    backgroundColor: "rgba(25, 118, 210, 0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  currentWeatherHeader: {
    flexDirection: "column", // Changed to column for better layout
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  temperatureText: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  weatherDescription: {
    fontSize: 16,
    color: "#BBDEFB",
    textAlign: "center",
  },
  weatherDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  weatherDetail: {
    width: "48%",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  weatherDetailTitle: {
    fontSize: 14,
    color: "#BBDEFB",
    marginVertical: 4,
  },
  weatherDetailValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  forecastContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 16,
  },
  forecastItem: {
    alignItems: "center",
    backgroundColor: "rgba(25, 118, 210, 0.2)",
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 80,
  },
  forecastTime: {
    fontSize: 14,
    color: "#BBDEFB",
    marginBottom: 8,
  },
  forecastTemp: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 8,
  },
  forecastWind: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  forecastWindText: {
    fontSize: 12,
    color: "#BBDEFB",
    marginLeft: 4,
  },
  marineInfoContainer: {
    backgroundColor: "rgba(25, 118, 210, 0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  marineInfoItem: {
    marginBottom: 16,
  },
  marineInfoTitle: {
    fontSize: 14,
    color: "#BBDEFB",
    marginBottom: 4,
  },
  marineInfoValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 8,
    padding: 12,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#BBDEFB",
    marginLeft: 8,
  },
});

export default WeatherScreen;
