import React from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import NavigationButtons from "@/components/NavigationButtons";
import Header from "@/components/onboard/Header";
import ProgressBar from "@/components/ProgressBar";
import { onboard, tabs, union } from "@/constants/styles";
import {
  useOnboarding,
  BrandBusinessInfoForm,
} from "@/contexts/OnboardingContext";

export default function BrandBusinessInfo() {
  const { data, updateBrandBusinessInfo } = useOnboarding();

  console.log("🏢 Brand Business Info - Current data:", data);
  console.log("🏢 Current brandBusinessInfo:", data.brandBusinessInfo);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BrandBusinessInfoForm>({
    defaultValues: data.brandBusinessInfo,
  });

  const onSubmit = (formData: BrandBusinessInfoForm) => {
    updateBrandBusinessInfo(formData);
    console.log("🏢 Brand business info saved to context:", formData);
    router.push("/brand/partnerships");
  };

  return (
    <View style={tabs.container}>
      <ProgressBar currentStep={2} totalSteps={3} progress={67} />

      <ScrollView
        style={onboard.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Business Information"
          subtitle="Tell us more about your company's size and industry focus."
        />

        <View style={onboard.card}>
          <Text style={onboard.cardTitle}>🏢 Company Details</Text>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Industry</Text>
            <Controller
              control={control}
              name="industry"
              rules={{
                required: "Please specify your industry",
                minLength: {
                  value: 2,
                  message: "Industry must be at least 2 characters",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={union.textInput}
                  placeholder="Fitness, Technology, Healthcare, etc."
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.industry && (
              <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                {errors.industry.message}
              </Text>
            )}
          </View>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Headquarters Location</Text>
            <Controller
              control={control}
              name="headquarters"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={union.textInput}
                  placeholder="San Francisco, CA"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
        </View>

        <View style={onboard.card}>
          <Text style={onboard.cardTitle}>📊 Company Size</Text>
          <Text style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
            Select your current employee range
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: "#666",
              textAlign: "center",
              marginTop: 16,
              fontStyle: "italic",
            }}
          >
            This helps partners understand your scale and capabilities
          </Text>
        </View>
      </ScrollView>

      <NavigationButtons
        onNext={handleSubmit(onSubmit)}
        showSkip={true}
        showBack={true}
        onBack={() => router.back()}
        onSkip={() => router.push("/brand/partnerships")}
      />
    </View>
  );
}
