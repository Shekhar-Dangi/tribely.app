import NavigationButtons from "@/components/NavigationButtons";
import Header from "@/components/onboard/Header";
import ProgressBar from "@/components/ProgressBar";
import PersonalRecordCard from "@/components/PersonalRecordCard";
import { onboard, tabs, union } from "@/constants/styles";
import { router } from "expo-router";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useOnboarding, PersonalStatsForm } from "@/contexts/OnboardingContext";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function Index() {
  const { data, updatePersonalStats } = useOnboarding();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalStatsForm>({
    defaultValues: data.personalStats,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "personalRecords",
  });

  const addPersonalRecord = () => {
    append({ exerciseName: "", subtitle: "", date: "" });
  };

  const removePersonalRecord = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = (formData: PersonalStatsForm) => {
    updatePersonalStats(formData);
    console.log("Personal Stats saved to context:", formData);
    router.push("/(onboard)/experiences");
  };

  return (
    <View style={tabs.container}>
      <ProgressBar currentStep={1} totalSteps={4} progress={25} />
      <ScrollView style={onboard.scrollView}>
        <Header
          title="Personal Stats"
          subtitle="Share your fitness metrics and personal records"
        />
        <View style={onboard.card}>
          <Text style={onboard.cardTitle}>Basic Measurements</Text>
          <View style={union.flexRow}>
            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>Height (cm) *</Text>
              <Controller
                control={control}
                name="height"
                rules={{
                  required: "Height is required",
                  pattern: {
                    value: /^\d+(\.\d+)?$/,
                    message: "Please enter a valid number",
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={union.textInput}
                    value={value}
                    onChangeText={onChange}
                    placeholder="e.g., 175"
                    keyboardType="numeric"
                  />
                )}
              />
              {errors.height && (
                <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                  {errors.height.message}
                </Text>
              )}
            </View>
            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>Weight (kg) *</Text>
              <Controller
                control={control}
                name="weight"
                rules={{
                  required: "Weight is required",
                  pattern: {
                    value: /^\d+(\.\d+)?$/,
                    message: "Please enter a valid number",
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={union.textInput}
                    value={value}
                    onChangeText={onChange}
                    placeholder="e.g., 70"
                    keyboardType="numeric"
                  />
                )}
              />
              {errors.weight && (
                <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                  {errors.weight.message}
                </Text>
              )}
            </View>
          </View>
          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Body Fat %</Text>
            <Controller
              control={control}
              name="bodyFat"
              rules={{
                max: 100,
                min: 0,
                pattern: {
                  value: /^\d+(\.\d+)?$/,
                  message: "Please enter a valid number",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={union.textInput}
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g., 15"
                  keyboardType="numeric"
                />
              )}
            />
            {errors.bodyFat && (
              <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                {errors.bodyFat.message}
              </Text>
            )}
          </View>
        </View>
        <View style={onboard.card}>
          <Text style={onboard.cardTitle}>Personal Records</Text>
          {fields.map((field, index) => (
            <PersonalRecordCard
              key={field.id}
              id={index + 1}
              control={control}
              index={index}
              onRemove={() => removePersonalRecord(index)}
              showRemove={fields.length > 1}
              errors={errors}
            />
          ))}
          <TouchableOpacity
            style={onboard.addButton}
            onPress={addPersonalRecord}
          >
            <Text style={onboard.addButtonText}>+ Add Another PR</Text>
          </TouchableOpacity>
        </View>

        <NavigationButtons
          onNext={handleSubmit(onSubmit)}
          showSkip={true}
          showBack={false}
        />
      </ScrollView>
    </View>
  );
}
