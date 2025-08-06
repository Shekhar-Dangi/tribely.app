import NavigationButtons from "@/components/NavigationButtons";
import Header from "@/components/onboard/Header";
import ProgressBar from "@/components/ProgressBar";
import CertificationCard from "@/components/CertificationCard";
import { onboard, tabs } from "@/constants/styles";
import { router } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useState, useEffect } from "react";
import {
  useOnboarding,
  CertificationsForm,
} from "@/contexts/OnboardingContext";

export default function Certifications() {
  const { data, updateCertifications, submitToDatabase } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CertificationsForm>({
    defaultValues: data.certifications,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "certifications",
  });

  // Watch for form changes and update context in real-time
  const watchedCertifications = useWatch({
    control,
    name: "certifications",
  });

  // Update context whenever form data changes
  useEffect(() => {
    if (watchedCertifications) {
      updateCertifications({ certifications: watchedCertifications });
    }
  }, [watchedCertifications, updateCertifications]);

  const addCertification = () => {
    append({
      title: "",
      subtitle: "",
      description: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      isActive: false,
    });
  };

  const removeCertification = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSkip = async () => {
    setIsSubmitting(true);

    try {
      // Clear certifications and submit
      const emptyCertifications: CertificationsForm = {
        certifications: [],
      };

      // Submit complete onboarding data to database with empty certifications
      await submitToDatabase(emptyCertifications);

      // Show success feedback
      Alert.alert(
        "Onboarding Complete! 🎉",
        "Your profile has been successfully created. Welcome to Tribely!",
        [
          {
            text: "Get Started",
            onPress: () => router.push("/(tabs)"),
          },
        ]
      );
    } catch (error) {
      console.error("Failed to complete onboarding:", error);

      // Show error feedback
      Alert.alert(
        "Oops! Something went wrong",
        "We couldn't complete your profile setup. Please try again.",
        [
          {
            text: "Try Again",
            style: "default",
          },
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (formData: CertificationsForm) => {
    setIsSubmitting(true);
    console.log("DDDD : ", formData);
    try {
      // Update certifications in context
      updateCertifications(formData);

      // Submit complete onboarding data to database with the fresh form data
      await submitToDatabase(formData);

      // Show success feedback
      Alert.alert(
        "Onboarding Complete! 🎉",
        "Your profile has been successfully created. Welcome to Tribely!",
        [
          {
            text: "Get Started",
            onPress: () => router.push("/(tabs)"),
          },
        ]
      );
    } catch (error) {
      console.error("Failed to complete onboarding:", error);

      // Show error feedback
      Alert.alert(
        "Oops! Something went wrong",
        "We couldn't complete your profile setup. Please try again.",
        [
          {
            text: "Try Again",
            style: "default",
          },
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={tabs.container}>
      <ProgressBar currentStep={4} totalSteps={4} progress={100} />

      <ScrollView
        style={onboard.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Certifications"
          subtitle="Showcase your fitness credentials and achievements"
        />

        <View style={onboard.card}>
          <Text style={onboard.cardTitle}>Professional Certifications</Text>
          {fields.map((field, index) => (
            <CertificationCard
              key={field.id}
              certification={field}
              index={index}
              control={control}
              errors={errors}
              onRemove={() => removeCertification(index)}
              showRemove={fields.length > 1}
            />
          ))}
          <TouchableOpacity
            style={onboard.addButton}
            onPress={addCertification}
          >
            <Text style={onboard.addButtonText}>
              + Add Another Certification
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <NavigationButtons
        onNext={handleSubmit(onSubmit)}
        onSkip={onSkip}
        showSkip={true}
        showBack={true}
        onBack={() => router.back()}
        nextText={isSubmitting ? "Completing..." : "Complete Profile"}
        nextDisabled={isSubmitting}
      />
    </View>
  );
}
