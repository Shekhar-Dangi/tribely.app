import React from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import NavigationButtons from "@/components/NavigationButtons";
import Header from "@/components/onboard/Header";
import ProgressBar from "@/components/ProgressBar";
import { onboard, tabs, union } from "@/constants/styles";
import { COLORS } from "@/constants/theme";
import {
  useOnboarding,
  MembershipPlansForm,
} from "@/contexts/OnboardingContext";

export default function GymMembershipPlans() {
  const { data, updateMembershipPlans } = useOnboarding();

  console.log("💳 Gym Membership Plans - Current data:", data);
  console.log("💳 Current membershipPlans:", data.membershipPlans);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MembershipPlansForm>({
    defaultValues: data.membershipPlans,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "plans",
  });

  const onSubmit = (formData: MembershipPlansForm) => {
    updateMembershipPlans(formData);
    console.log("💳 Membership Plans saved to context:", formData);
    console.log("💳 Updated context data:", {
      ...data,
      membershipPlans: formData,
    });
    router.push("./stats");
  };

  const addPlan = () => {
    append({
      name: "",
      price: "",
      duration: "",
      features: [""],
    });
  };

  const removePlan = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <View style={tabs.container}>
      <ProgressBar currentStep={2} totalSteps={3} progress={66} />

      <ScrollView
        style={onboard.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Membership Plans"
          subtitle="Set up your membership options. You can add multiple plans to suit different member needs."
        />

        {fields.map((field, index) => (
          <View key={field.id} style={onboard.card}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={onboard.cardTitle}>💪 Plan {index + 1}</Text>
              {fields.length > 1 && (
                <TouchableOpacity
                  onPress={() => removePlan(index)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: COLORS.error,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={union.flexRow}>
              <View style={union.textInputContainer}>
                <Text style={union.textInputLabel}>Plan Name *</Text>
                <Controller
                  control={control}
                  name={`plans.${index}.name`}
                  rules={{
                    required: "Plan name is required",
                    minLength: {
                      value: 2,
                      message: "Plan name must be at least 2 characters",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={union.textInput}
                      placeholder="Basic, Premium, VIP..."
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.plans?.[index]?.name && (
                  <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                    {errors.plans[index]?.name?.message}
                  </Text>
                )}
              </View>

              <View style={union.textInputContainer}>
                <Text style={union.textInputLabel}>Price *</Text>
                <Controller
                  control={control}
                  name={`plans.${index}.price`}
                  rules={{
                    required: "Price is required",
                    pattern: {
                      value: /^\d+(\.\d{1,2})?$/,
                      message: "Enter valid price (e.g., 49 or 49.99)",
                    },
                    min: {
                      value: 1,
                      message: "Price must be greater than 0",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={union.textInput}
                      placeholder="49.99"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      keyboardType="numeric"
                    />
                  )}
                />
                {errors.plans?.[index]?.price && (
                  <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                    {errors.plans[index]?.price?.message}
                  </Text>
                )}
              </View>
            </View>

            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>Duration *</Text>
              <Controller
                control={control}
                name={`plans.${index}.duration`}
                rules={{
                  required: "Duration is required",
                  minLength: {
                    value: 3,
                    message:
                      "Please specify the duration (e.g., Monthly, Annual)",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={union.textInput}
                    placeholder="Monthly, 3 months, Annual..."
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.plans?.[index]?.duration && (
                <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                  {errors.plans[index]?.duration?.message}
                </Text>
              )}
            </View>

            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>Features (one per line)</Text>
              <Controller
                control={control}
                name={`plans.${index}.features.0`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[union.textInput, { height: 80 }]}
                    placeholder="Access to all equipment&#10;24/7 gym access&#10;Free parking&#10;Locker room access&#10;One guest pass per month"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    multiline
                    textAlignVertical="top"
                  />
                )}
              />
            </View>
          </View>
        ))}

        <TouchableOpacity style={onboard.addButton} onPress={addPlan}>
          <Text style={onboard.addButtonText}>+ Add Another Plan</Text>
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 12,
            color: "#666",
            textAlign: "center",
            marginHorizontal: 32,
            marginTop: 16,
            fontStyle: "italic",
            lineHeight: 16,
          }}
        >
          💡 Tip: Add different membership tiers (Basic, Premium, VIP) to give
          members options that fit their needs and budget.
        </Text>
      </ScrollView>

      <NavigationButtons
        onNext={handleSubmit(onSubmit)}
        showSkip={true}
        showBack={true}
        onBack={() => router.back()}
        onSkip={() => {
          console.log("💳 Skipping membership plans");
          router.push("./stats");
        }}
      />
    </View>
  );
}
