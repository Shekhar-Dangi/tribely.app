import { useAuth } from "@clerk/clerk-expo";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function SplashScreenPage() {
  return <View style={{ flex: 1, backgroundColor: "#000" }} />;
}

export function SplashScreenController() {
  const { isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hide();
    }
  }, [isLoaded]);

  return null;
}
