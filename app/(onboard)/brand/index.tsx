import React from "react";
import { View, Text, ScrollView, TextInput } from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import NavigationButtons from "@/components/NavigationButtons";
import Header from "@/components/onboard/Header";
import ProgressBar from "@/components/ProgressBar";
import { onboard, tabs, union } from "@/constants/styles";
import {
  useOnboarding,
  BrandContactInfoForm,
} from "@/contexts/OnboardingContext";

export default function BrandContactInfo() {
  const { data, updateBrandContactInfo } = useOnboarding();

  console.log("🏢 Brand Contact Info - Current data:", data);
  console.log("🏢 Current brandContactInfo:", data.brandContactInfo);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandContactInfoForm>({
    defaultValues: data.brandContactInfo,
  });

  const onSubmit = (formData: BrandContactInfoForm) => {
    updateBrandContactInfo(formData);
    console.log("🏢 Brand contact info saved to context:", formData);
    router.push("/brand/business");
  };

  return (
    <View style={tabs.container}>
      <ProgressBar currentStep={1} totalSteps={3} progress={33} />

      <ScrollView
        style={onboard.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Contact Information"
          subtitle="Let's start with your brand's contact details and online presence."
        />

        <View style={onboard.card}>
          <Text style={onboard.cardTitle}>🌐 Online Presence</Text>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Company Website</Text>
            <Controller
              control={control}
              name="website"
              rules={{
                pattern: {
                  value:
                    /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                  message: "Please enter a valid website URL",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={union.textInput}
                  placeholder="https://your-company.com"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              )}
            />
            {errors.website && (
              <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                {errors.website.message}
              </Text>
            )}
          </View>
        </View>

        <View style={onboard.card}>
          <Text style={onboard.cardTitle}>📞 Contact Details</Text>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Business Phone</Text>
            <Controller
              control={control}
              name="contactInfo.phone"
              rules={{
                pattern: {
                  value: /^[\+]?[1-9][\d]{0,15}$/,
                  message: "Please enter a valid phone number",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={union.textInput}
                  placeholder="+1 (555) 123-4567"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                />
              )}
            />
            {errors.contactInfo?.phone && (
              <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                {errors.contactInfo.phone.message}
              </Text>
            )}
          </View>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Business Email</Text>
            <Controller
              control={control}
              name="contactInfo.email"
              rules={{
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email address",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={union.textInput}
                  placeholder="contact@company.com"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            {errors.contactInfo?.email && (
              <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                {errors.contactInfo.email.message}
              </Text>
            )}
          </View>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Business Address</Text>
            <Controller
              control={control}
              name="contactInfo.address"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={union.textInput}
                  placeholder="123 Business St, City, State 12345"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  multiline={true}
                  numberOfLines={2}
                />
              )}
            />
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
            This information helps partners and customers connect with your
            brand
          </Text>
        </View>
      </ScrollView>

      <NavigationButtons
        onNext={handleSubmit(onSubmit)}
        showSkip={true}
        showBack={true}
        onBack={() => router.back()}
        onSkip={() => router.push("/brand/business")}
      />
    </View>
  );
}
