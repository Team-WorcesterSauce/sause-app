import * as Location from "expo-location";
import { GeoPoint } from "../models/types";

// 전역 변수로 마지막 위치 저장
let lastKnownPosition: GeoPoint | null = null;

// 직접 함수를 내보내는 방식으로 재구성
/**
 * Requests permission and gets the current location
 */
export async function getLocation(): Promise<GeoPoint> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      throw new Error("위치 접근 권한이 거부되었습니다");
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const position: GeoPoint = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude ?? undefined,
    };

    lastKnownPosition = position;
    return position;
  } catch (error) {
    console.error("위치 정보 가져오기 오류:", error);
    throw error;
  }
}

// 위치 업데이트 관련 변수
let locationWatchId: Location.LocationSubscription | null = null;
let locationUpdateCallback: ((location: GeoPoint) => void) | null = null;

/**
 * 사용자의 위치 업데이트를 시작합니다
 * @param callback 위치가 업데이트되면 호출할 함수
 */
export async function startLocationUpdates(
  callback: (location: GeoPoint) => void
): Promise<void> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      throw new Error("위치 접근 권한이 거부되었습니다");
    }

    // Store callback
    locationUpdateCallback = callback;

    // Start watching position
    locationWatchId = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Update if moved 10 meters
      },
      (location) => {
        const position: GeoPoint = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude ?? undefined,
        };

        lastKnownPosition = position;

        // Call the callback with updated position
        if (locationUpdateCallback) {
          locationUpdateCallback(position);
        }
      }
    );
  } catch (error) {
    console.error("위치 업데이트 시작 오류:", error);
    throw error;
  }
}

/**
 * 사용자의 위치 업데이트를 중지합니다
 */
export function stopLocationUpdates(): void {
  if (locationWatchId) {
    locationWatchId.remove();
    locationWatchId = null;
    locationUpdateCallback = null;
  }
}

/**
 * 새로운 요청 없이 마지막으로 알려진 위치를 가져옵니다
 */
export function getLastKnownPosition(): GeoPoint | null {
  return lastKnownPosition;
}

/**
 * 두 지점 사이의 거리를 킬로미터 단위로 계산합니다
 */
export function calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
  const R = 6371; // 지구 반지름(km)
  const dLat = deg2rad(point2.latitude - point1.latitude);
  const dLon = deg2rad(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1.latitude)) *
      Math.cos(deg2rad(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * 도(degree)를 라디안(radian)으로 변환합니다
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
