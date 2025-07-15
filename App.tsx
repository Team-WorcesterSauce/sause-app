import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import AppNavigator from "./src/navigation/AppNavigator";
import { AppContextProvider } from "./src/contexts/AppContext";
import { theme } from "./src/theme/theme";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AppContextProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </AppContextProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
