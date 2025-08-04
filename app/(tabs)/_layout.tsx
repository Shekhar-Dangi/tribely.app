import { useAuth } from "@clerk/clerk-expo";
import { Tabs } from "expo-router";

export default function RootLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  return (
    <Tabs>
      <Tabs.Protected guard={isLoaded && isSignedIn}>
        <Tabs.Screen name="index" />
      </Tabs.Protected>
    </Tabs>
  );
}
