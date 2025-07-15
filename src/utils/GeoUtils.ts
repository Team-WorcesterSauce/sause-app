export interface ICoordinates {
  lat: number;
  lng: number;
}

/**
 * 위도, 경도를 3D 구체 표면의 xyz 좌표로 변환
 */
export const latLngToVector = (
  lat: number,
  lng: number,
  radius: number
): [number, number, number] => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return [x, y, z];
};

/**
 * 두 지점 사이의 거리 계산 (km)
 */
export const calculateDistance = (
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number => {
  const R = 6371; // 지구 반경 (km)

  const lat1 = (point1.latitude * Math.PI) / 180;
  const lat2 = (point2.latitude * Math.PI) / 180;
  const latDiff = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const lngDiff = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(lngDiff / 2) *
      Math.sin(lngDiff / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * 두 숫자 배열이 근사적으로 같은지 확인 (부동소수점 오차 허용)
 */
export const areArraysEqual = (
  arr1: number[],
  arr2: number[],
  precision: number = 0.000001
): boolean => {
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (Math.abs(arr1[i] - arr2[i]) > precision) return false;
  }

  return true;
};

/**
 * 날씨 코드에서 아이콘 이름 반환
 */
export const getWeatherIconName = (conditionCode: number): string => {
  // OpenWeatherMap 조건 코드 기준 (https://openweathermap.org/weather-conditions)
  if (conditionCode >= 200 && conditionCode < 300) return "cloud-lightning"; // 천둥번개
  if (conditionCode >= 300 && conditionCode < 400) return "cloud-drizzle"; // 이슬비
  if (conditionCode >= 500 && conditionCode < 600) return "cloud-rain"; // 비
  if (conditionCode >= 600 && conditionCode < 700) return "cloud-snow"; // 눈
  if (conditionCode >= 700 && conditionCode < 800) return "wind"; // 안개, 연무 등
  if (conditionCode === 800) return "sun"; // 맑음
  if (conditionCode > 800 && conditionCode <= 804) return "cloud"; // 구름

  return "help-circle"; // 기본값
};

/**
 * 풍향을 텍스트로 변환
 */
export const getWindDirectionText = (degrees: number): string => {
  const directions = [
    "북",
    "북북동",
    "북동",
    "동북동",
    "동",
    "동남동",
    "남동",
    "남남동",
    "남",
    "남남서",
    "남서",
    "서남서",
    "서",
    "서북서",
    "북서",
    "북북서",
  ];

  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

/**
 * 기온에 따른 색상 반환
 */
export const getTemperatureColor = (celsius: number): string => {
  if (celsius <= -10) return "#0022FF"; // 매우 추움 (진한 파랑)
  if (celsius <= 0) return "#0099FF"; // 추움 (파랑)
  if (celsius <= 10) return "#00CCFF"; // 시원함 (하늘색)
  if (celsius <= 20) return "#00FFCC"; // 선선함 (민트색)
  if (celsius <= 25) return "#FFFF00"; // 따뜻함 (노랑)
  if (celsius <= 30) return "#FF9900"; // 더움 (주황)
  return "#FF0000"; // 매우 더움 (빨강)
};

/**
 * 타임스탬프를 날짜 형식으로 변환
 */
export const formatDate = (timestamp: number | Date): string => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
