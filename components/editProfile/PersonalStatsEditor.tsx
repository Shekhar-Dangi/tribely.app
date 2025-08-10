import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import {
  Controller,
  useFieldArray,
  Control,
  FieldErrors,
} from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { union, onboard, editProfile } from "@/constants/styles";

interface PersonalStatsEditorProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

export default function PersonalStatsEditor({
  control,
  errors,
}: PersonalStatsEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "personalStats.personalRecords",
  });

  const addPersonalRecord = () => {
    append({ exerciseName: "", subtitle: "", date: "" });
  };

  const removePersonalRecord = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <View style={onboard.wideCard}>
      <Text style={onboard.cardTitle}>Personal Stats</Text>

      {/* Basic Measurements */}
      <View style={union.flexRow}>
        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Height (cm)</Text>
          <Controller
            control={control}
            name="personalStats.height"
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
                value={value?.toString() || ""}
                onChangeText={onChange}
                placeholder="e.g., 175"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />
            )}
          />
          {(errors as any)?.personalStats?.height && (
            <Text style={editProfile.errorText}>
              {(errors as any).personalStats.height.message}
            </Text>
          )}
        </View>

        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Weight (kg)</Text>
          <Controller
            control={control}
            name="personalStats.weight"
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
                value={value?.toString() || ""}
                onChangeText={onChange}
                placeholder="e.g., 70"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />
            )}
          />
          {(errors as any)?.personalStats?.weight && (
            <Text style={editProfile.errorText}>
              {(errors as any).personalStats.weight.message}
            </Text>
          )}
        </View>
      </View>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Body Fat %</Text>
        <Controller
          control={control}
          name="personalStats.bodyFat"
          rules={{
            max: {
              value: 100,
              message: "Body fat cannot exceed 100%",
            },
            min: {
              value: 0,
              message: "Body fat cannot be negative",
            },
            pattern: {
              value: /^\d+(\.\d+)?$/,
              message: "Please enter a valid number",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={union.textInput}
              value={value?.toString() || ""}
              onChangeText={onChange}
              placeholder="e.g., 15"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
            />
          )}
        />
        {(errors as any)?.personalStats?.bodyFat && (
          <Text style={editProfile.errorText}>
            {(errors as any).personalStats.bodyFat.message}
          </Text>
        )}
      </View>

      {/* Personal Records */}
      <Text style={[onboard.cardTitle, { marginTop: 24, marginBottom: 16 }]}>
        Personal Records
      </Text>

      {fields.map((field, index) => (
        <View key={field.id} style={{ marginBottom: 16, position: "relative" }}>
          {fields.length > 1 && (
            <TouchableOpacity
              style={union.removeButton}
              onPress={() => removePersonalRecord(index)}
            >
              <Ionicons name="close" size={16} color={COLORS.error} />
            </TouchableOpacity>
          )}

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Exercise Name *</Text>
            <Controller
              control={control}
              name={`personalStats.personalRecords.${index}.exercise`}
              rules={{ required: "Exercise name is required" }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={union.textInput}
                  value={value || ""}
                  onChangeText={onChange}
                  placeholder="e.g., Bench Press"
                  placeholderTextColor={COLORS.textMuted}
                />
              )}
            />
            {(errors as any)?.personalStats?.personalRecords?.[index]
              ?.exercise && (
              <Text style={editProfile.errorText}>
                {
                  (errors as any).personalStats.personalRecords[index].exercise
                    .message
                }
              </Text>
            )}
          </View>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Record Details *</Text>
            <Controller
              control={control}
              name={`personalStats.personalRecords.${index}.weight`}
              rules={{ required: "Record details are required" }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={union.textInput}
                  value={value || ""}
                  onChangeText={onChange}
                  placeholder="e.g., 225 lbs x 5 reps"
                  placeholderTextColor={COLORS.textMuted}
                />
              )}
            />
            {(errors as any)?.personalStats?.personalRecords?.[index]
              ?.weight && (
              <Text style={editProfile.errorText}>
                {
                  (errors as any).personalStats.personalRecords[index].weight
                    .message
                }
              </Text>
            )}
          </View>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Date Achieved</Text>
            <Controller
              control={control}
              name={`personalStats.personalRecords.${index}.date`}
              rules={{
                pattern: {
                  value: /^\d{4}-\d{2}-\d{2}$/,
                  message: "Please enter date in YYYY-MM-DD format",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={union.textInput}
                  value={value || ""}
                  onChangeText={onChange}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.textMuted}
                />
              )}
            />
            {(errors as any)?.personalStats?.personalRecords?.[index]?.date && (
              <Text style={editProfile.errorText}>
                {
                  (errors as any).personalStats.personalRecords[index].date
                    .message
                }
              </Text>
            )}
          </View>
        </View>
      ))}

      <TouchableOpacity style={onboard.addButton} onPress={addPersonalRecord}>
        <Text style={onboard.addButtonText}>+ Add Another PR</Text>
      </TouchableOpacity>
    </View>
  );
}
