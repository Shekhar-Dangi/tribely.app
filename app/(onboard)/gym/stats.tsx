import React from "react";
import { View, Text, ScrollView, TextInput } from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import NavigationButtons from "@/components/NavigationButtons";
import Header from "@/components/onboard/Header";
import ProgressBar from "@/components/ProgressBar";
import { onboard, tabs, union } from "@/constants/styles";
import { useOnboarding, GymStatsForm } from "@/contexts/OnboardingContext";

export default function GymStats() {
  const { data, updateGymStats, submitToDatabase } = useOnboarding();

  console.log("📊 Gym Stats - Current data:", data);
  console.log("📊 Current gymStats:", data.gymStats);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GymStatsForm>({
    defaultValues: data.gymStats,
  });

  const onSubmit = async (formData: GymStatsForm) => {
    updateGymStats(formData);
    console.log("📊 Gym Stats saved to context:", formData);
    console.log("📊 Final context data for submission:", {
      ...data,
      gymStats: formData,
    });

    try {
      console.log("📊 Submitting gym onboarding to database...");
      await submitToDatabase(undefined, formData);
      console.log("📊 Gym onboarding submitted successfully!");
      router.push("/(tabs)");
    } catch (error) {
      console.error("📊 Error submitting gym onboarding:", error);
    }
  };

  return (
    <View style={tabs.container}>
      <ProgressBar currentStep={3} totalSteps={3} progress={100} />

      <ScrollView
        style={onboard.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Gym Statistics"
          subtitle="Help members understand the size and capacity of your facility."
        />

        <View style={onboard.card}>
          <Text style={onboard.cardTitle}>📈 Current Stats</Text>

          <View style={union.flexRow}>
            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>Member Count</Text>
              <Controller
                control={control}
                name="memberCount"
                rules={{
                  pattern: {
                    value: /^\d+$/,
                    message: "Please enter a valid number",
                  },
                  min: {
                    value: 0,
                    message: "Member count cannot be negative",
                  },
                  max: {
                    value: 10000,
                    message: "Please enter a reasonable number",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={union.textInput}
                    placeholder="250"
                    value={String(value)}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(parseInt(text, 10) || 0)}
                    keyboardType="numeric"
                  />
                )}
              />
              {errors.memberCount && (
                <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                  {errors.memberCount.message}
                </Text>
              )}
            </View>

            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>Trainer Count</Text>
              <Controller
                control={control}
                name="trainerCount"
                rules={{
                  pattern: {
                    value: /^\d+$/,
                    message: "Please enter a valid number",
                  },
                  min: {
                    value: 0,
                    message: "Trainer count cannot be negative",
                  },
                  max: {
                    value: 500,
                    message: "Please enter a reasonable number",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={union.textInput}
                    placeholder="12"
                    value={String(value)}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(parseInt(text, 10) || 0)}
                    keyboardType="numeric"
                  />
                )}
              />
              {errors.trainerCount && (
                <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                  {errors.trainerCount.message}
                </Text>
              )}
            </View>
          </View>

          <Text
            style={{
              fontSize: 14,
              color: "#666",
              textAlign: "center",
              marginTop: 16,
              fontStyle: "italic",
            }}
          >
            These stats help members understand your gym&apos;s capacity and
            community size
          </Text>
        </View>

        <View style={onboard.card}>
          <Text style={onboard.cardTitle}>🎉 Almost Done!</Text>
          <Text
            style={{
              fontSize: 16,
              color: "#333",
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            You&apos;re all set! Your gym profile will help members discover and
            connect with your fitness community.
          </Text>
        </View>
      </ScrollView>

      <NavigationButtons
        onNext={handleSubmit(onSubmit)}
        showSkip={true}
        showBack={true}
        onBack={() => router.back()}
        onSkip={async () => {
          console.log("📊 Skipping gym stats, completing setup...");
          try {
            await submitToDatabase();
            console.log(
              "📊 Gym onboarding submitted successfully (skipped stats)!"
            );
            router.push("/(tabs)");
          } catch (error) {
            console.error("📊 Error submitting gym onboarding:", error);
          }
        }}
      />
    </View>
  );
}
