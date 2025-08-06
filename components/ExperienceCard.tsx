import React from "react";
import { View, Text, TextInput, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Controller, Control, FieldErrors, useWatch } from "react-hook-form";
import { union } from "@/constants/styles";
import { COLORS } from "@/constants/theme";

interface Experience {
  title: string;
  subtitle: string;
  description: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

interface ExperiencesForm {
  experiences: Experience[];
}

interface ExperienceCardProps {
  experience: Experience;
  index: number;
  control: Control<ExperiencesForm>;
  errors: FieldErrors<ExperiencesForm>;
  onRemove: () => void;
  showRemove: boolean;
}

export default function ExperienceCard({
  experience,
  index,
  control,
  errors,
  onRemove,
  showRemove,
}: ExperienceCardProps) {
  // Watch the current experience values to implement conditional validation
  const currentExperience = useWatch({
    control,
    name: `experiences.${index}`,
  });

  // Check if any field in this experience has content (to trigger "all or nothing" rule)
  const hasAnyContent =
    currentExperience?.title ||
    currentExperience?.subtitle ||
    currentExperience?.description ||
    currentExperience?.startDate ||
    currentExperience?.endDate ||
    currentExperience?.isCurrent;

  return (
    <View style={{ position: "relative", marginBottom: 24 }}>
      {showRemove && (
        <TouchableOpacity style={union.removeButton} onPress={onRemove}>
          <Ionicons
            name="close-circle-outline"
            size={24}
            color={COLORS.secondary}
          />
        </TouchableOpacity>
      )}

      <Text
        style={[
          union.textInputLabel,
          { fontSize: 16, fontWeight: "600", marginBottom: 16 },
        ]}
      >
        Experience #{index + 1}
      </Text>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Job Title / Role *</Text>
        <Controller
          control={control}
          name={`experiences.${index}.title`}
          rules={{
            validate: (value) => {
              if (hasAnyContent && !value) {
                return "Job title is required when experience is filled";
              }
              return true;
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={union.textInput}
              value={value}
              onChangeText={onChange}
              placeholder="e.g., Personal Trainer, Fitness Coach"
            />
          )}
        />
        {errors.experiences?.[index]?.title && (
          <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
            {errors.experiences[index]?.title?.message}
          </Text>
        )}
      </View>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Company / Organization *</Text>
        <Controller
          control={control}
          name={`experiences.${index}.subtitle`}
          rules={{
            validate: (value) => {
              if (hasAnyContent && !value) {
                return "Company/Organization is required when experience is filled";
              }
              return true;
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={union.textInput}
              value={value}
              onChangeText={onChange}
              placeholder="e.g., Gold's Gym, Freelance"
            />
          )}
        />
        {errors.experiences?.[index]?.subtitle && (
          <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
            {errors.experiences[index]?.subtitle?.message}
          </Text>
        )}
      </View>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Description</Text>
        <Controller
          control={control}
          name={`experiences.${index}.description`}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[
                union.textInput,
                { height: 80, textAlignVertical: "top" },
              ]}
              value={value}
              onChangeText={onChange}
              placeholder="Describe your role and achievements..."
              multiline
            />
          )}
        />
      </View>

      <View style={union.flexRow}>
        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Start Date *</Text>
          <Controller
            control={control}
            name={`experiences.${index}.startDate`}
            rules={{
              validate: (value) => {
                if (hasAnyContent && !value) {
                  return "Start date is required when experience is filled";
                }
                if (value && !/^(0[1-9]|1[0-2])-\d{4}$/.test(value)) {
                  return "Please enter date in MM-YYYY format";
                }
                return true;
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={union.textInput}
                value={value}
                onChangeText={onChange}
                placeholder="MM-YYYY"
                maxLength={7}
              />
            )}
          />
          {errors.experiences?.[index]?.startDate && (
            <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
              {errors.experiences[index]?.startDate?.message}
            </Text>
          )}
        </View>

        <Controller
          control={control}
          name={`experiences.${index}.isCurrent`}
          render={({ field: { onChange, value } }) => (
            <>
              {!value && (
                <View style={union.textInputContainer}>
                  <Text style={union.textInputLabel}>End Date</Text>
                  <Controller
                    control={control}
                    name={`experiences.${index}.endDate`}
                    rules={{
                      validate: (endValue) => {
                        if (
                          hasAnyContent &&
                          !currentExperience?.isCurrent &&
                          !endValue
                        ) {
                          return "End date is required when experience is filled (unless currently working)";
                        }
                        if (
                          endValue &&
                          !/^(0[1-9]|1[0-2])-\d{4}$/.test(endValue)
                        ) {
                          return "Please enter date in MM-YYYY format";
                        }
                        return true;
                      },
                    }}
                    render={({
                      field: { onChange: onEndDateChange, value: endDateValue },
                    }) => (
                      <TextInput
                        style={union.textInput}
                        value={endDateValue}
                        onChangeText={onEndDateChange}
                        placeholder="MM-YYYY"
                        maxLength={7}
                      />
                    )}
                  />
                  {errors.experiences?.[index]?.endDate && (
                    <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                      {errors.experiences[index]?.endDate?.message}
                    </Text>
                  )}
                </View>
              )}
            </>
          )}
        />
      </View>

      <Controller
        control={control}
        name={`experiences.${index}.isCurrent`}
        render={({ field: { onChange, value } }) => (
          <View style={[union.flexRow, { alignItems: "center", marginTop: 8 }]}>
            <Switch
              value={value}
              onValueChange={onChange}
              trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              thumbColor={value ? COLORS.white : COLORS.textMuted}
            />
            <Text
              style={[
                union.textInputLabel,
                { marginLeft: 12, marginBottom: 0 },
              ]}
            >
              I currently work here
            </Text>
          </View>
        )}
      />
    </View>
  );
}
