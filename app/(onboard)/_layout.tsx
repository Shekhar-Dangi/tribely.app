import { Stack } from "expo-router";
import { OnboardingProvider } from "@/contexts/OnboardingContext";

export default function OnboardLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false, // Prevent swipe back during onboarding
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="user-type" />
        <Stack.Screen name="basic-profile" />

        {/* Individual flow */}
        <Stack.Screen name="individual/stats" />
        <Stack.Screen name="individual/experience" />
        <Stack.Screen name="individual/final" />

        {/* Gym flow */}
        <Stack.Screen name="gym/business" />
        <Stack.Screen name="gym/amenities" />
        <Stack.Screen name="gym/final" />

        {/* Brand flow */}
        <Stack.Screen name="brand/company" />
        <Stack.Screen name="brand/campaigns" />
        <Stack.Screen name="brand/final" />

        {/* Legacy screens - can be removed once new flow is complete */}
        <Stack.Screen name="index" />
        <Stack.Screen name="category" />
        <Stack.Screen name="experiences" />
        <Stack.Screen name="certifications" />
      </Stack>
    </OnboardingProvider>
  );
}
