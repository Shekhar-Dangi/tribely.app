import React from "react";
import { View, Text, ScrollView, TextInput } from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import NavigationButtons from "@/components/NavigationButtons";
import Header from "@/components/onboard/Header";
import ProgressBar from "@/components/ProgressBar";
import { onboard, tabs, union } from "@/constants/styles";
import { useOnboarding, BusinessInfoForm } from "@/contexts/OnboardingContext";

export default function GymBusinessInfo() {
  const { data, updateBusinessInfo } = useOnboarding();

  console.log("🏋️‍♂️ Gym Business Info - Current data:", data);
  console.log("🏋️‍♂️ Current businessInfo:", data.businessInfo);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessInfoForm>({
    defaultValues: data.businessInfo,
  });

  const onSubmit = (formData: BusinessInfoForm) => {
    updateBusinessInfo(formData);
    console.log("🏋️‍♂️ Business Info saved to context:", formData);
    console.log("🏋️‍♂️ Updated context data:", {
      ...data,
      businessInfo: formData,
    });
    router.push("/(onboard)/gym/membership");
  };

  return (
    <View style={tabs.container}>
      <ProgressBar currentStep={1} totalSteps={3} progress={33} />

      <ScrollView
        style={onboard.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Business Information"
          subtitle="Tell us about your gym or fitness center. This helps members find and connect with you."
        />

        <View style={onboard.card}>
          <Text style={onboard.cardTitle}>📍 Location & Contact</Text>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Business Address *</Text>
            <Controller
              control={control}
              name="address"
              rules={{
                required: "Business address is required",
                minLength: {
                  value: 5,
                  message: "Please enter a complete address",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={union.textInput}
                  placeholder="123 Fitness Street, City, State 12345"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  multiline
                />
              )}
            />
            {errors.address && (
              <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                {errors.address.message}
              </Text>
            )}
          </View>

          <View style={union.flexRow}>
            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>Phone Number</Text>
              <Controller
                control={control}
                name="phone"
                rules={{
                  pattern: {
                    value: /^[\+]?[1-9][\d]{0,15}$/,
                    message: "Please enter a valid phone number",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={union.textInput}
                    placeholder="(555) 123-4567"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    keyboardType="phone-pad"
                  />
                )}
              />
              {errors.phone && (
                <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                  {errors.phone.message}
                </Text>
              )}
            </View>

            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>Website</Text>
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
                    placeholder="www.yourgym.com"
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
        </View>

        <View style={onboard.card}>
          <Text style={onboard.cardTitle}>🕐 Operating Hours</Text>

          <View style={union.flexRow}>
            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>Monday</Text>
              <Controller
                control={control}
                name="operatingHours.monday"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={union.textInput}
                    placeholder="6:00 AM - 10:00 PM"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>

            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>Tuesday</Text>
              <Controller
                control={control}
                name="operatingHours.tuesday"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={union.textInput}
                    placeholder="6:00 AM - 10:00 PM"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
          </View>

          <View style={union.flexRow}>
            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>Wednesday</Text>
              <Controller
                control={control}
                name="operatingHours.wednesday"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={union.textInput}
                    placeholder="6:00 AM - 10:00 PM"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>

            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>Thursday</Text>
              <Controller
                control={control}
                name="operatingHours.thursday"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={union.textInput}
                    placeholder="6:00 AM - 10:00 PM"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
          </View>

          <View style={union.flexRow}>
            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>Friday</Text>
              <Controller
                control={control}
                name="operatingHours.friday"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={union.textInput}
                    placeholder="6:00 AM - 10:00 PM"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>

            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>Saturday</Text>
              <Controller
                control={control}
                name="operatingHours.saturday"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={union.textInput}
                    placeholder="7:00 AM - 8:00 PM"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
          </View>

          <View style={union.flexRow}>
            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>Sunday</Text>
              <Controller
                control={control}
                name="operatingHours.sunday"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={union.textInput}
                    placeholder="8:00 AM - 6:00 PM"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
            <View style={union.textInputContainer} />
          </View>

          <Text
            style={{
              fontSize: 12,
              color: "#666",
              textAlign: "center",
              marginTop: 12,
              fontStyle: "italic",
            }}
          >
            💡 Tip: You can leave any day blank if you&apos;re closed. Example:
            &quot;6:00 AM - 10:00 PM&quot;
          </Text>
        </View>

        <View style={onboard.card}>
          <Text style={onboard.cardTitle}>🏋️ Amenities & Features</Text>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>
              Gym Amenities (one per line)
            </Text>
            <Controller
              control={control}
              name="amenities"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[union.textInput, { height: 100 }]}
                  placeholder="Free parking&#10;Locker rooms&#10;Showers&#10;Air conditioning&#10;24/7 access&#10;Personal training&#10;Group classes"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  multiline
                  textAlignVertical="top"
                />
              )}
            />
          </View>

          <Text
            style={{
              fontSize: 12,
              color: "#666",
              textAlign: "center",
              marginTop: 8,
              fontStyle: "italic",
            }}
          >
            💡 List the amenities and features that make your gym special
          </Text>
        </View>
      </ScrollView>

      <NavigationButtons
        onNext={handleSubmit(onSubmit)}
        showSkip={false}
        showBack={true}
        onBack={() => router.back()}
      />
    </View>
  );
}
