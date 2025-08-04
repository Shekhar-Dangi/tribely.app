import LandingScreen from "@/components/LandingScreen";

import { View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LandingScreen />
    </View>
  );
}
