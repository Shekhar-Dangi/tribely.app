import React from "react";
import { View, Text, TextInput, TouchableOpacity, Switch } from "react-native";
import {
  Controller,
  useFieldArray,
  Control,
  FieldErrors,
} from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { union, onboard, editProfile } from "@/constants/styles";

interface ExperienceEditorProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

export default function ExperienceEditor({
  control,
  errors,
}: ExperienceEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  const addExperience = () => {
    append({
      title: "",
      subtitle: "",
      description: "",
      logoUrl: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
    });
  };

  const removeExperience = (index: number) => {
    remove(index);
  };

  return (
    <View style={onboard.wideCard}>
      <Text style={onboard.cardTitle}>Experience & Background</Text>

      {fields.length === 0 && (
        <Text style={editProfile.helpText}>
          Add your fitness journey, work experience, or relevant background
        </Text>
      )}

      {fields.map((field, index) => (
        <View key={field.id} style={{ marginBottom: 16, position: "relative" }}>
          <TouchableOpacity
            style={union.removeButton}
            onPress={() => removeExperience(index)}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.secondary} />
          </TouchableOpacity>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Title *</Text>
            <Controller
              control={control}
              name={`experience.${index}.title`}
              rules={{ required: "Title is required" }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={union.textInput}
                  value={value || ""}
                  onChangeText={onChange}
                  placeholder="e.g., Personal Trainer"
                  placeholderTextColor={COLORS.textMuted}
                />
              )}
            />
            {(errors as any)?.experience?.[index]?.title && (
              <Text style={editProfile.errorText}>
                {(errors as any).experience[index].title.message}
              </Text>
            )}
          </View>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Company</Text>
            <Controller
              control={control}
              name={`experience.${index}.company`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={union.textInput}
                  value={value || ""}
                  onChangeText={onChange}
                  placeholder="e.g., Gold's Gym"
                  placeholderTextColor={COLORS.textMuted}
                />
              )}
            />
          </View>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Description</Text>
            <Controller
              control={control}
              name={`experience.${index}.description`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[union.textInput, editProfile.bioInput]}
                  value={value || ""}
                  onChangeText={onChange}
                  placeholder="Describe your role and achievements..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={3}
                />
              )}
            />
          </View>

          <View style={union.flexRow}>
            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>Start Date *</Text>
              <Controller
                control={control}
                name={`experience.${index}.startDate`}
                rules={{
                  required: "Start date is required",
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
              {(errors as any)?.experience?.[index]?.startDate && (
                <Text style={editProfile.errorText}>
                  {(errors as any).experience[index].startDate.message}
                </Text>
              )}
            </View>

            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>End Date</Text>
              <Controller
                control={control}
                name={`experience.${index}.endDate`}
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
                    editable={
                      !control._formValues.experience?.[index]?.isCurrent
                    }
                  />
                )}
              />
              {(errors as any)?.experience?.[index]?.endDate && (
                <Text style={editProfile.errorText}>
                  {(errors as any).experience[index].endDate.message}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.switchContainer}>
            <Text style={union.textInputLabel}>Currently working here</Text>
            <Controller
              control={control}
              name={`experience.${index}.isCurrent`}
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value || false}
                  onValueChange={(newValue) => {
                    onChange(newValue);
                    if (newValue) {
                      // Clear end date if current
                      control._formValues.experience[index].endDate = "";
                    }
                  }}
                  trackColor={{
                    false: COLORS.lightGray,
                    true: COLORS.secondary,
                  }}
                  thumbColor={value ? COLORS.white : COLORS.textMuted}
                />
              )}
            />
          </View>
        </View>
      ))}

      <TouchableOpacity style={onboard.addButton} onPress={addExperience}>
        <Text style={onboard.addButtonText}>+ Add Experience</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  switchContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 12,
  },
};
