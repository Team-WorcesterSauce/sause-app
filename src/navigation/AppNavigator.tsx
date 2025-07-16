import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import WeatherScreen from "../screens/WeatherScreen";
import RouteScreen from "../screens/RouteScreen";
import WarningScreen from "../screens/WarningScreen";
import DisasterScreen from '../screens/DisasterScreen';

// Navigation parameter types
export type RootStackParamList = {
  MainTabs: undefined;
  WeatherDetail: { locationId: string };
  RouteDetail: { routeId: string };
  WarningDetail: { warningId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Weather: undefined;
  Route: undefined;
  Warnings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Bottom Tab Navigation
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Home") {
            iconName = focused ? "earth" : "earth-outline";
          } else if (route.name === "Weather") {
            iconName = focused ? "cloudy" : "cloudy-outline";
          } else if (route.name === "Route") {
            iconName = focused ? "navigate" : "navigate-outline";
          } else if (route.name === "Warnings") {
            iconName = focused ? "warning" : "warning-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#0066cc",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Weather" component={WeatherScreen} />
      <Tab.Screen name="Route" component={RouteScreen} />
      <Tab.Screen name="Warnings" component={WarningScreen} />
    </Tab.Navigator>
  );
};

// Root Stack Navigation
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainTabs">
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Disaster"
          component={DisasterScreen}
          options={{
            title: '재난 정보',
            headerStyle: {
              backgroundColor: '#4A90E2',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        {/* Add more stack screens as needed for detail views */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
