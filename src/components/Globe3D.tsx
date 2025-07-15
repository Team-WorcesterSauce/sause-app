import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";
import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import { Asset } from "expo-asset";
import * as THREE from "three";

const { width, height } = Dimensions.get("window");

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

interface Globe3DProps {
  currentLocation?: GeoPoint;
  weatherPoints?: Array<{
    location: GeoPoint;
    type: "rain" | "snow" | "hail" | "clear" | "cloud";
  }>;
}

export default function Globe3D({
  currentLocation,
  weatherPoints,
}: Globe3DProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  const cameraRef = useRef<THREE.Camera>(null);

  // 로딩 타임아웃 설정 (5초)
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Loading timeout reached");
        setError("지구본 로딩 시간이 초과되었습니다. 기본 지구본을 표시합니다.");
        setLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading]);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    try {
      console.log("GLView context created, starting initialization...");
      
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 8;
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({
        context: gl,
      });
      renderer.setSize(width, height);

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(10, 10, 10);
      scene.add(dirLight);

      console.log("Scene and lighting setup complete");

      // Earth with basic material first (no texture)
      const geometry = new THREE.SphereGeometry(2.5, 64, 64);
      const material = new THREE.MeshStandardMaterial({ 
        color: "#4A90E2",
        metalness: 0.1,
        roughness: 0.8
      });
      const earth = new THREE.Mesh(geometry, material);
      earthRef.current = earth;
      scene.add(earth);

      console.log("Earth mesh created");

      // Marker: current location
      if (currentLocation) {
        scene.add(createMarker(currentLocation, "#ff0000", 0.1));
        console.log("Current location marker added");
      }

      // Weather markers
      weatherPoints?.forEach(({ location, type }) => {
        scene.add(createMarker(location, getWeatherColor(type), 0.06));
      });
      console.log("Weather markers added");

      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      
      animate();
      console.log("Animation started");
      
      // Set loading to false immediately after basic setup
      setLoading(false);
      setError(null);

      // Load texture asynchronously without blocking
      loadTexture(require("../../assets/images/earth-texture.png"))
        .then((texture) => {
          console.log("Texture loaded successfully");
          material.map = texture;
          material.needsUpdate = true;
        })
        .catch((textureError) => {
          console.warn("Texture loading failed, using solid color:", textureError);
          // Continue with solid color material - no error shown to user
        });
      
    } catch (error) {
      console.error("Error in onContextCreate:", error);
      setError("지구본 초기화 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  // 사용자의 터치 회전을 PanResponder로 처리
  const lastTouch = useRef({ x: 0, y: 0 });
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        lastTouch.current = { x: gestureState.x0, y: gestureState.y0 };
      },
      onPanResponderMove: (
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        if (earthRef.current) {
          const dx = gestureState.moveX - lastTouch.current.x;
          const dy = gestureState.moveY - lastTouch.current.y;
          const rotationSpeed = 0.005;

          earthRef.current.rotation.y += dx * rotationSpeed;
          earthRef.current.rotation.x += dy * rotationSpeed;

          lastTouch.current = { x: gestureState.moveX, y: gestureState.moveY };
        }
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>지구본 로딩 중...</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <GLView style={styles.canvas} onContextCreate={onContextCreate} />
      <Legend />
    </View>
  );
}

const loadTexture = async (localAsset: number): Promise<THREE.Texture> => {
  try {
    console.log("Starting texture load...");
    const asset = Asset.fromModule(localAsset);
    await asset.downloadAsync();
    console.log("Asset downloaded, localUri:", asset.localUri);
    
    return await new Promise<THREE.Texture>((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        asset.localUri || "",
        (texture) => {
          console.log("Texture loaded successfully");
          resolve(texture);
        },
        (progress) => {
          console.log("Texture loading progress:", progress);
        },
        (error) => {
          console.error("Texture loading error:", error);
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error("Error in loadTexture:", error);
    throw error;
  }
};

const createMarker = (location: GeoPoint, color: string, size: number) => {
  const phi = (90 - location.latitude) * (Math.PI / 180);
  const theta = (location.longitude + 180) * (Math.PI / 180);
  const r = 2.5 + 0.05;

  const x = -r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi);
  const z = r * Math.sin(phi) * Math.sin(theta);

  const geometry = new THREE.SphereGeometry(size, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  return mesh;
};

const getWeatherColor = (type: string): string => {
  switch (type) {
    case "rain":
      return "#4287f5";
    case "snow":
      return "#ffffff";
    case "hail":
      return "#b3c7f7";
    case "clear":
      return "#f2e05c";
    case "cloud":
      return "#b8b8b8";
    default:
      return "#ffffff";
  }
};

const Legend = () => {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(14, 25, 40)",
  },
  canvas: {
    width,
    height,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  errorContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
    zIndex: 5,
  },
  errorSubText: {
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
