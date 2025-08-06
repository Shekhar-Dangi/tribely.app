import NavigationButtons from "@/components/NavigationButtons";
import Header from "@/components/onboard/Header";
import ProgressBar from "@/components/ProgressBar";
import ExperienceCard from "@/components/ExperienceCard";
import { onboard, tabs } from "@/constants/styles";
import { router } from "expo-router";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useOnboarding, ExperiencesForm } from "@/contexts/OnboardingContext";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useEffect } from "react";

export default function Experiences() {
  const { data, updateExperiences } = useOnboarding();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ExperiencesForm>({
    defaultValues: data.experiences,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experiences",
  });

  // Watch for form changes and update context in real-time
  const watchedExperiences = useWatch({
    control,
    name: "experiences",
  });

  // Update context whenever form data changes
  useEffect(() => {
    if (watchedExperiences) {
      updateExperiences({ experiences: watchedExperiences });
    }
  }, [watchedExperiences, updateExperiences]);

  const addExperience = () => {
    append({
      title: "",
      subtitle: "",
      description: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
    });
  };

  const removeExperience = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = (formData: ExperiencesForm) => {
    updateExperiences(formData);
    console.log("Experiences saved to context:", formData);
    router.push("/(onboard)/certifications");
  };

  return (
    <View style={tabs.container}>
      <ProgressBar currentStep={3} totalSteps={4} progress={75} />

      <ScrollView
        style={onboard.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Experiences"
          subtitle="Add your fitness journey and professional experience"
        />

        <View style={onboard.card}>
          <Text style={onboard.cardTitle}>Professional Experience</Text>
          {fields.map((field, index) => (
            <ExperienceCard
              key={field.id}
              experience={field}
              index={index}
              control={control}
              errors={errors}
              onRemove={() => removeExperience(index)}
              showRemove={fields.length > 1}
            />
          ))}
          <TouchableOpacity style={onboard.addButton} onPress={addExperience}>
            <Text style={onboard.addButtonText}>+ Add Another Experience</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <NavigationButtons
        onNext={handleSubmit(onSubmit)}
        showSkip={true}
        showBack={true}
        onBack={() => router.back()}
      />
    </View>
  );
}
