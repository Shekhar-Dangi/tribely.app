import React from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
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
  PartnershipsForm,
  Partnership,
} from "@/contexts/OnboardingContext";

const partnerTypeOptions: {
  label: string;
  value: Partnership["partnerType"];
}[] = [
  { label: "Gym", value: "gym" },
  { label: "Individual", value: "individual" },
  { label: "Brand", value: "brand" },
];

export default function BrandPartnerships() {
  const { data, updatePartnerships, submitToDatabase } = useOnboarding();

  console.log("🤝 Brand Partnerships - Current data:", data);
  console.log("🤝 Current partnerships:", data.partnerships);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PartnershipsForm>({
    defaultValues: data.partnerships,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "partnerships",
  });

  const onSubmit = async (formData: PartnershipsForm) => {
    updatePartnerships(formData);
    console.log("🤝 Brand partnerships saved to context:", formData);
    console.log("🤝 Final context data for submission:", {
      ...data,
      partnerships: formData,
    });

    try {
      console.log("🤝 Submitting brand onboarding to database...");
      await submitToDatabase(undefined, undefined, formData);
      console.log("🤝 Brand onboarding submitted successfully!");
      router.push("/(tabs)");
    } catch (error) {
      console.error("🤝 Error submitting brand onboarding:", error);
    }
  };

  const addPartnership = () => {
    append({
      partnerName: "",
      partnerType: "gym",
      partnership_type: "",
      startDate: "",
      endDate: "",
      isActive: true,
    });
  };

  const removePartnership = (index: number) => {
    Alert.alert(
      "Remove Partnership",
      "Are you sure you want to remove this partnership?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => remove(index) },
      ]
    );
  };

  return (
    <View style={tabs.container}>
      <ProgressBar currentStep={3} totalSteps={3} progress={100} />

      <ScrollView
        style={onboard.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Partnership Network"
          subtitle="Showcase your business relationships and collaborations."
        />

        <View style={onboard.card}>
          <Text style={onboard.cardTitle}>🤝 Current Partnerships</Text>

          {fields.map((field, index) => (
            <View
              key={field.id}
              style={{
                backgroundColor: "#f8f9fa",
                padding: 16,
                marginBottom: 16,
                borderRadius: 8,
                position: "relative",
              }}
            >
              <TouchableOpacity
                style={[
                  union.removeButton,
                  {
                    backgroundColor: COLORS.error,
                    borderRadius: 12,
                  },
                ]}
                onPress={() => removePartnership(index)}
              >
                <Text style={union.removeButtonText}>×</Text>
              </TouchableOpacity>

              <View style={union.textInputContainer}>
                <Text style={union.textInputLabel}>Partner Name</Text>
                <Controller
                  control={control}
                  name={`partnerships.${index}.partnerName`}
                  rules={{
                    required: "Partner name is required",
                    minLength: {
                      value: 2,
                      message: "Partner name must be at least 2 characters",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={union.textInput}
                      placeholder="Partner company or person name"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.partnerships?.[index]?.partnerName && (
                  <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                    {errors.partnerships[index]?.partnerName?.message}
                  </Text>
                )}
              </View>

              <View style={union.flexRow}>
                <View style={union.textInputContainer}>
                  <Text style={union.textInputLabel}>Partner Type</Text>
                  <View style={{ gap: 8 }}>
                    {partnerTypeOptions.map((option) => (
                      <Controller
                        key={option.value}
                        control={control}
                        name={`partnerships.${index}.partnerType`}
                        render={({ field: { onChange, value } }) => (
                          <TouchableOpacity
                            style={[
                              {
                                padding: 12,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor:
                                  value === option.value
                                    ? COLORS.secondary
                                    : COLORS.border,
                                backgroundColor:
                                  value === option.value
                                    ? `${COLORS.secondary}15`
                                    : "white",
                              },
                            ]}
                            onPress={() => onChange(option.value)}
                          >
                            <Text
                              style={{
                                color:
                                  value === option.value
                                    ? COLORS.secondary
                                    : COLORS.text,
                                fontWeight:
                                  value === option.value ? "600" : "400",
                              }}
                            >
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                    ))}
                  </View>
                </View>

                <View style={union.textInputContainer}>
                  <Text style={union.textInputLabel}>Partnership Type</Text>
                  <Controller
                    control={control}
                    name={`partnerships.${index}.partnership_type`}
                    rules={{
                      required: "Partnership type is required",
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={union.textInput}
                        placeholder="Sponsorship, Collaboration, etc."
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                      />
                    )}
                  />
                  {errors.partnerships?.[index]?.partnership_type && (
                    <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                      {errors.partnerships[index]?.partnership_type?.message}
                    </Text>
                  )}
                </View>
              </View>

              <View style={union.flexRow}>
                <View style={union.textInputContainer}>
                  <Text style={union.textInputLabel}>Start Date</Text>
                  <Controller
                    control={control}
                    name={`partnerships.${index}.startDate`}
                    rules={{
                      required: "Start date is required",
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={union.textInput}
                        placeholder="2024-01-01"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                      />
                    )}
                  />
                  {errors.partnerships?.[index]?.startDate && (
                    <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                      {errors.partnerships[index]?.startDate?.message}
                    </Text>
                  )}
                </View>

                <View style={union.textInputContainer}>
                  <Text style={union.textInputLabel}>End Date (Optional)</Text>
                  <Controller
                    control={control}
                    name={`partnerships.${index}.endDate`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={union.textInput}
                        placeholder="2024-12-31 or leave empty if ongoing"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <Controller
                  control={control}
                  name={`partnerships.${index}.isActive`}
                  render={({ field: { onChange, value } }) => (
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                      onPress={() => onChange(!value)}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          borderWidth: 2,
                          borderColor: COLORS.secondary,
                          backgroundColor: value
                            ? COLORS.secondary
                            : "transparent",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {value && (
                          <Text style={{ color: "white", fontSize: 12 }}>
                            ✓
                          </Text>
                        )}
                      </View>
                      <Text style={{ fontSize: 14, color: COLORS.text }}>
                        Currently Active Partnership
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          ))}

          <TouchableOpacity style={onboard.addButton} onPress={addPartnership}>
            <Text style={onboard.addButtonText}>+ Add Partnership</Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 14,
              color: "#666",
              textAlign: "center",
              marginTop: 16,
              fontStyle: "italic",
            }}
          >
            Partnerships help showcase your brand&apos;s network and credibility
          </Text>
        </View>

        <View style={onboard.card}>
          <Text style={onboard.cardTitle}>🎉 Ready to Launch!</Text>
          <Text
            style={{
              fontSize: 16,
              color: "#333",
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            You&apos;re all set! Your brand profile will help you connect with
            gyms, individuals, and other brands in the fitness community.
          </Text>
        </View>
      </ScrollView>

      <NavigationButtons
        onNext={handleSubmit(onSubmit)}
        showSkip={true}
        showBack={true}
        onBack={() => router.back()}
        onSkip={async () => {
          console.log("🤝 Skipping partnerships, completing brand setup...");
          try {
            await submitToDatabase();
            console.log(
              "🤝 Brand onboarding submitted successfully (skipped partnerships)!"
            );
            router.push("/(tabs)");
          } catch (error) {
            console.error("🤝 Error submitting brand onboarding:", error);
          }
        }}
      />
    </View>
  );
}
