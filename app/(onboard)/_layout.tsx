import { Stack } from "expo-router";
import { OnboardingProvider } from "@/contexts/OnboardingContext";

export default function RootLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="category" />
        <Stack.Screen name="index" />
        <Stack.Screen name="experiences" />
        <Stack.Screen name="certifications" />
        <Stack.Screen name="gym" />
        <Stack.Screen name="brand" />
      </Stack>
    </OnboardingProvider>
  );
}
