import { useAuth } from "@clerk/clerk-expo";
import { Tabs } from "expo-router";

export default function RootLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Protected guard={isLoaded && isSignedIn}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="create" />
        <Tabs.Screen name="events" />
        <Tabs.Screen name="explore" />
        <Tabs.Screen name="profile" />
      </Tabs.Protected>
    </Tabs>
  );
}
