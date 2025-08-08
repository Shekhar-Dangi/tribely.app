import { Stack } from "expo-router";

export default function GymOnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="membership" />
      <Stack.Screen name="stats" />
    </Stack>
  );
}
