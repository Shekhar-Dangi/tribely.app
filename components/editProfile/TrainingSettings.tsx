import React from "react";
import { View, Text, TextInput, Switch } from "react-native";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { COLORS } from "@/constants/theme";
import { union, onboard, editProfile } from "@/constants/styles";

interface TrainingSettingsProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  watch: any;
}

export default function TrainingSettings({
  control,
  errors,
  watch,
}: TrainingSettingsProps) {
  const isTrainingEnabled = watch("isTrainingEnabled");

  return (
    <View style={onboard.wideCard}>
      <Text style={onboard.cardTitle}>Training Services</Text>

      <View style={styles.switchContainer}>
        <View style={styles.switchTextContainer}>
          <Text style={union.textInputLabel}>Offer Training Services</Text>
          <Text style={editProfile.helpText}>
            Enable this to offer personal training to other users
          </Text>
        </View>
        <Controller
          control={control}
          name="isTrainingEnabled"
          render={({ field: { onChange, value } }) => (
            <Switch
              value={value || false}
              onValueChange={onChange}
              trackColor={{ false: COLORS.lightGray, true: COLORS.secondary }}
              thumbColor={value ? COLORS.white : COLORS.textMuted}
            />
          )}
        />
      </View>

      {isTrainingEnabled && (
        <>
          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>
              Training Price (per session)
            </Text>
            <Controller
              control={control}
              name="trainingPrice"
              rules={{
                required: isTrainingEnabled
                  ? "Training price is required when offering services"
                  : false,
                min: {
                  value: 0,
                  message: "Price cannot be negative",
                },
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: "Please enter a valid price (e.g., 50.00)",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={[union.textInput, styles.priceInput]}
                    value={value?.toString() || ""}
                    onChangeText={(text) =>
                      onChange(text ? parseFloat(text) : undefined)
                    }
                    placeholder="50.00"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                  />
                </View>
              )}
            />
            {(errors as any)?.trainingPrice && (
              <Text style={editProfile.errorText}>
                {(errors as any).trainingPrice.message}
              </Text>
            )}
            <Text style={editProfile.helpText}>
              Set your hourly rate for personal training sessions
            </Text>
          </View>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Affiliation</Text>
            <Controller
              control={control}
              name="affiliation"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={union.textInput}
                  value={value || ""}
                  onChangeText={onChange}
                  placeholder="e.g., NASM Certified, Gold's Gym Partner"
                  placeholderTextColor={COLORS.textMuted}
                />
              )}
            />
            <Text style={editProfile.helpText}>
              Mention any gym affiliations or certifying organizations
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = {
  switchContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 12,
    marginBottom: 16,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  priceInputContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  currencySymbol: {
    position: "absolute" as const,
    left: 12,
    fontSize: 16,
    color: COLORS.text,
    zIndex: 1,
  },
  priceInput: {
    paddingLeft: 28,
  },
};
