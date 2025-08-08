import { Stack } from "expo-router";

export default function BrandLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="business" />
      <Stack.Screen name="partnerships" />
    </Stack>
  );
}
