import { DefaultTheme } from "react-native-paper";

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#0066cc", // 메인 색상
    accent: "#03dac6", // 강조 색상
    background: "#f6f6f6",
    surface: "#ffffff",
    text: "#000000",
    error: "#B00020",
    success: "#4CAF50",
    warning: "#FF9800",
    info: "#2196F3",
    disabled: "#C7C7CD",
  },
  roundness: 8, // 모서리 라운드
  animation: {
    scale: 1.0,
  },
  // 앱에서 사용할 공통 스타일
  styles: {
    container: {
      flex: 1,
      backgroundColor: "#f6f6f6",
    },
    card: {
      margin: 10,
      borderRadius: 8,
      elevation: 4,
    },
    section: {
      padding: 15,
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: "600",
      marginVertical: 5,
    },
    text: {
      fontSize: 16,
    },
    caption: {
      fontSize: 14,
      color: "#666",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    spaceBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  },
};
