import React, { createContext, useState, useEffect, useContext } from "react";
import { GeoPoint, WeatherData } from "../models/types";
import { getLocation } from "../services/LocationService";
import { getCurrentWeather } from "../services/WeatherService";

interface LocationContextProps {
  currentLocation: GeoPoint | null;
  isLoading: boolean;
  error: string | null;
  updateLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextProps>({
  currentLocation: null,
  isLoading: true,
  error: null,
  updateLocation: async () => {},
});

export const useLocation = () => useContext(LocationContext);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const updateLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const location = await getLocation();
      setCurrentLocation(location);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "위치 정보를 가져오는데 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{ currentLocation, isLoading, error, updateLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
};

// 날씨 컨텍스트
interface WeatherContextProps {
  currentWeather: WeatherData | null;
  weatherLoading: boolean;
  weatherError: string | null;
  updateWeather: (location?: GeoPoint) => Promise<void>;
}

const WeatherContext = createContext<WeatherContextProps>({
  currentWeather: null,
  weatherLoading: true,
  weatherError: null,
  updateWeather: async () => {},
});

export const useWeather = () => useContext(WeatherContext);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentLocation } = useLocation();
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(
    null
  );
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const updateWeather = async (location?: GeoPoint) => {
    if (!location && !currentLocation) {
      setWeatherError("위치 정보가 없습니다.");
      return;
    }

    try {
      setWeatherLoading(true);
      setWeatherError(null);
      const locationToUse = location || currentLocation!;
      const weather = await getCurrentWeather(locationToUse);
      setCurrentWeather(weather);
    } catch (err) {
      setWeatherError(
        err instanceof Error
          ? err.message
          : "날씨 정보를 가져오는데 실패했습니다."
      );
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    if (currentLocation) {
      updateWeather(currentLocation);
    }
  }, [currentLocation]);

  return (
    <WeatherContext.Provider
      value={{ currentWeather, weatherLoading, weatherError, updateWeather }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

// 결합된 공급자
export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <LocationProvider>
      <WeatherProvider>{children}</WeatherProvider>
    </LocationProvider>
  );
};
