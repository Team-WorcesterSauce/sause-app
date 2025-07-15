import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import { Canvas } from "@react-three/fiber/native";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei/native";
import { Asset } from "expo-asset";
import { GeoPoint } from "../models/types";
import SimpleGlobe from "./SimpleGlobe";

// 범례 컴포넌트
const Legend: React.FC = () => {
  const legendItems = [
    { color: "#ff0000", label: "현재 위치", icon: "📍" },
    { color: "#f2e05c", label: "맑음", icon: "☀️" },
    { color: "#4287f5", label: "비", icon: "🌧️" },
    { color: "#ffffff", label: "눈", icon: "❄️" },
    { color: "#b3c7f7", label: "우박", icon: "🌨️" },
    { color: "#b8b8b8", label: "흐림", icon: "☁️" },
  ];

  return (
    <View style={styles.legendContainer}>
      <Text style={styles.legendTitle}>범례</Text>
      {legendItems.map((item, index) => (
        <View key={index} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={styles.legendIcon}>{item.icon}</Text>
          <Text style={styles.legendLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

// 오류 경계 컴포넌트
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Globe3D Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// 텍스처 로딩 함수
const loadTexture = async (localAsset: any): Promise<THREE.Texture> => {
  const asset = Asset.fromModule(localAsset);
  await asset.downloadAsync();
  
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      asset.localUri || "",
      (texture) => {
        resolve(texture);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
};

interface Globe3DProps {
  currentLocation?: GeoPoint;
  weatherPoints?: Array<{
    location: GeoPoint;
    type: "rain" | "snow" | "hail" | "clear" | "cloud";
  }>;
}

/**
 * 3D 지구본 컴포넌트
 * Three.js와 React Three Fiber를 사용하여 3D 지구본을 렌더링합니다.
 */
const Globe3D: React.FC<Globe3DProps> = ({
  currentLocation,
  weatherPoints,
}) => {
  return (
    <ErrorBoundary
      fallback={
        <SimpleGlobe
          currentLocation={currentLocation}
          weatherPoints={weatherPoints}
        />
      }
    >
      <View style={styles.container}>
        <React.Suspense
          fallback={
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>지구본 로딩 중...</Text>
            </View>
          }
        >
          <Canvas
            style={styles.canvas}
            camera={{ position: [0, 0, 8], fov: 55 }}
          >
            <ambientLight intensity={10} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <pointLight position={[-10, -10, -10]} intensity={0.8} />
            <directionalLight position={[0, 0, 5]} intensity={0.5} />
            <Earth
              position={[0, 0, 0]}
              currentLocation={currentLocation}
              weatherPoints={weatherPoints}
            />
            <OrbitControls
              enableZoom={true}
              enablePan={true}
              enableRotate={true}
              zoomSpeed={0.6}
              panSpeed={0.6}
              rotateSpeed={0.9}
              minDistance={3}
              maxDistance={15}
              enableDamping={true}
              dampingFactor={0.05}
            />
          </Canvas>
        </React.Suspense>

        {/* 범례 */}
        <Legend />
      </View>
    </ErrorBoundary>
  );
};

interface EarthProps {
  position: [number, number, number];
  currentLocation?: GeoPoint;
  weatherPoints?: Array<{
    location: GeoPoint;
    type: "rain" | "snow" | "hail" | "clear" | "cloud";
  }>;
}

/**
 * 지구본 메쉬 컴포넌트
 */
const Earth: React.FC<EarthProps> = ({
  position,
  currentLocation,
  weatherPoints,
}) => {
  // 텍스처 상태 관리
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null);
  const [cloudsTexture, setCloudsTexture] = useState<THREE.Texture | null>(
    null
  );
  const [texturesLoaded, setTexturesLoaded] = useState(false);

  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // 텍스처 로드
  useEffect(() => {
    const loadTextures = async () => {
      try {
        const [earthTex, cloudsTex] = await Promise.all([
          loadTexture(require("../../assets/images/earth-texture.png")),
          loadTexture(require("../../assets/images/clouds.png")),
        ]);

        setEarthTexture(earthTex);
        setCloudsTexture(cloudsTex);
        setTexturesLoaded(true);
      } catch (error) {
        console.error("텍스처 로드 실패:", error);
        setTexturesLoaded(true); // 실패해도 기본 색상으로 렌더링
      }
    };

    loadTextures();
  }, []);

  // 현재 위치에서 지구본 방향 조정 함수
  useEffect(() => {
    if (currentLocation && earthRef.current) {
      // 위도/경도를 3D 구체 위의 좌표로 변환
      const phi = (90 - currentLocation.latitude) * (Math.PI / 180);
      const theta = (currentLocation.longitude + 180) * (Math.PI / 180);

      // 구체 표면 위치 계산
      const x = -Math.sin(phi) * Math.cos(theta);
      const z = Math.sin(phi) * Math.sin(theta);
      const y = Math.cos(phi);

      // 여기서 카메라 위치를 조정하거나 회전을 조정할 수 있음
      // (이 예제에서는 구현되지 않음)
    }
  }, [currentLocation]);

  // 날씨 점 색상 설정
  const getWeatherPointColor = (type: string) => {
    switch (type) {
      case "rain":
        return "#4287f5"; // 파란색
      case "snow":
        return "#ffffff"; // 흰색
      case "hail":
        return "#b3c7f7"; // 옅은 파란색
      case "clear":
        return "#f2e05c"; // 노란색
      case "cloud":
        return "#b8b8b8"; // 회색
      default:
        return "#ffffff"; // 기본값
    }
  };

  return (
    <group position={position}>
      {/* 텍스처 로딩 중일 때는 렌더링하지 않음 */}
      {texturesLoaded && (
        <>
          {/* 지구본 */}
          <mesh ref={earthRef}>
            <sphereGeometry args={[2.5, 64, 64]} />
            <meshStandardMaterial
              map={earthTexture}
              color={earthTexture ? undefined : "#4A90E2"}
              metalness={0.0}
              roughness={0.8}
              emissive={earthTexture ? "#000000" : "#001122"}
              emissiveIntensity={earthTexture ? 0 : 0.1}
            />

            {/* 현재 위치 표시 - 지구본 자식으로 배치 */}
            {currentLocation && (
              <LocationMarker
                location={currentLocation}
                color="#ff0000"
                size={0.1}
              />
            )}

            {/* 날씨 정보 표시 - 지구본 자식으로 배치 */}
            {weatherPoints &&
              weatherPoints.map((point, index) => (
                <LocationMarker
                  key={index}
                  location={point.location}
                  color={getWeatherPointColor(point.type)}
                  size={0.06}
                />
              ))}
          </mesh>

          {/* 구름층 */}
          {/* <mesh ref={cloudsRef}>
            <sphereGeometry args={[2.55, 64, 64]} />
            <meshStandardMaterial
              map={cloudsTexture}
              color={cloudsTexture ? undefined : "#FFFFFF"}
              transparent={true}
              opacity={0.3}
              depthWrite={false}
              emissive="#ffffff"
              emissiveIntensity={0.1}
            />
          </mesh> */}
        </>
      )}
    </group>
  );
};

interface LocationMarkerProps {
  location: GeoPoint;
  color: string;
  size: number;
  ref?: React.Ref<THREE.Mesh>;
}

/**
 * 위치 마커 컴포넌트
 */
const LocationMarker: React.FC<LocationMarkerProps> = ({
  location,
  color,
  size,
}) => {
  // 위도/경도를 3D 구체 위의 좌표로 변환
  const phi = (90 - location.latitude) * (Math.PI / 180);
  const theta = (location.longitude + 180) * (Math.PI / 180);

  // 구체 표면 위치 계산 (지구 반지름 + 약간의 오프셋)
  const radius = 2.5 + 0.05; // 지구 반지름 + 오프셋
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(14, 25, 40)",
  },
  canvas: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgb(14, 25, 40)",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgb(14, 25, 40)",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  errorDetails: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
  },
  legendContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 10,
    padding: 12,
    minWidth: 140,
  },
  legendTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  legendIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  legendLabel: {
    color: "#fff",
    fontSize: 12,
    flex: 1,
  },
});

export default Globe3D;
