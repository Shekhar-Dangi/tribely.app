import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { union } from "@/constants/styles";
import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Controller, Control, FieldErrors, useWatch } from "react-hook-form";

interface PersonalStatsForm {
  height: string;
  weight: string;
  bodyFat: string;
  personalRecords: {
    exerciseName: string;
    subtitle: string;
    date: string;
  }[];
}

interface PersonalRecordCardProps {
  id: number;
  control: Control<PersonalStatsForm>;
  index: number;
  onRemove?: () => void;
  showRemove?: boolean;
  errors: FieldErrors<PersonalStatsForm>;
}

export default function PersonalRecordCard({
  id,
  control,
  index,
  onRemove,
  showRemove = false,
  errors,
}: PersonalRecordCardProps) {
  // Watch the current PR values to implement conditional validation
  const currentPR = useWatch({
    control,
    name: `personalRecords.${index}`,
  });

  // Check if any field in this PR has content (to trigger "all or nothing" rule)
  const hasAnyContent =
    currentPR?.exerciseName || currentPR?.subtitle || currentPR?.date;

  return (
    <View style={{ position: "relative", marginBottom: 20 }}>
      {showRemove && (
        <Pressable style={union.removeButton} onPress={onRemove}>
          <Ionicons
            name="close-circle-outline"
            size={24}
            color={COLORS.secondary}
          />
        </Pressable>
      )}
      <Text style={{ color: COLORS.secondary, marginBottom: 16 }}>
        PR #{id}
      </Text>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Exercise Name</Text>
        <Controller
          control={control}
          name={`personalRecords.${index}.exerciseName`}
          rules={{
            validate: (value) => {
              if (hasAnyContent && !value) {
                return "Exercise name is required when PR is filled";
              }
              return true;
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={union.textInput}
              value={value}
              onChangeText={onChange}
              placeholder="e.g., Bench Press"
            />
          )}
        />
        {errors.personalRecords?.[index]?.exerciseName && (
          <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
            {errors.personalRecords[index]?.exerciseName?.message}
          </Text>
        )}
      </View>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Subtitle</Text>
        <Controller
          control={control}
          name={`personalRecords.${index}.subtitle`}
          rules={{
            validate: (value) => {
              if (hasAnyContent && !value) {
                return "Subtitle is required when PR is filled";
              }
              return true;
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={union.textInput}
              value={value}
              onChangeText={onChange}
              placeholder="e.g., 225 lbs x 5 reps"
            />
          )}
        />
        {errors.personalRecords?.[index]?.subtitle && (
          <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
            {errors.personalRecords[index]?.subtitle?.message}
          </Text>
        )}
      </View>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Date</Text>
        <Controller
          control={control}
          name={`personalRecords.${index}.date`}
          rules={{
            validate: (value) => {
              if (hasAnyContent && !value) {
                return "Date is required when PR is filled";
              }
              if (
                value &&
                !/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/.test(value)
              ) {
                return "Please enter date in DD-MM-YYYY format";
              }
              return true;
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={union.textInput}
              value={value}
              onChangeText={onChange}
              placeholder="DD-MM-YYYY"
              maxLength={10}
            />
          )}
        />
        {errors.personalRecords?.[index]?.date && (
          <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
            {errors.personalRecords[index]?.date?.message}
          </Text>
        )}
      </View>
    </View>
  );
}
