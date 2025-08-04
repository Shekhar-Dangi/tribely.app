import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import { SplashScreenController } from "./splash";

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <SplashScreenController />
      <RootNavigator />
    </ClerkProvider>
  );
}

function RootNavigator() {
  const { isSignedIn, isLoaded } = useAuth();
  return (
    <Stack>
      <Stack.Protected guard={isLoaded && isSignedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="index" />
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}
