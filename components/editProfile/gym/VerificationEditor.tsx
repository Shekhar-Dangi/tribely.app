import React from "react";
import { View, Text, TextInput, Switch } from "react-native";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { COLORS } from "@/constants/theme";
import { union, onboard, editProfile } from "@/constants/styles";

interface VerificationEditorProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  watch: any;
}

export default function VerificationEditor({
  control,
  errors,
  watch,
}: VerificationEditorProps) {
  const isVerified = watch("verification.isVerified");

  return (
    <View style={onboard.card}>
      <Text style={onboard.cardTitle}>Business Verification</Text>
      <Text style={editProfile.helpText}>
        Provide business documents for verification (helps build trust)
      </Text>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Business License Number</Text>
        <Controller
          control={control}
          name="verification.businessLicense"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={union.textInput}
              value={value || ""}
              onChangeText={onChange}
              placeholder="BL-2024-12345"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
            />
          )}
        />
        <Text style={editProfile.helpText}>
          Enter your business license number issued by local authorities
        </Text>
      </View>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Tax ID / EIN</Text>
        <Controller
          control={control}
          name="verification.taxId"
          rules={{
            pattern: {
              value: /^\d{2}-\d{7}$|^\d{9}$/,
              message: "Please enter a valid Tax ID (XX-XXXXXXX or XXXXXXXXX)",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={union.textInput}
              value={value || ""}
              onChangeText={onChange}
              placeholder="12-3456789"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
            />
          )}
        />
        {(errors as any)?.verification?.taxId && (
          <Text style={editProfile.errorText}>
            {(errors as any).verification.taxId.message}
          </Text>
        )}
        <Text style={editProfile.helpText}>
          Federal Tax Identification Number (EIN)
        </Text>
      </View>

      <View style={styles.switchContainer}>
        <View style={styles.switchTextContainer}>
          <Text style={union.textInputLabel}>Verification Status</Text>
          <Text style={editProfile.helpText}>
            Mark as verified if you have completed verification process
          </Text>
        </View>
        <Controller
          control={control}
          name="verification.isVerified"
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

      {isVerified && (
        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Verification Date</Text>
          <Controller
            control={control}
            name="verification.verificationDate"
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
          {(errors as any)?.verification?.verificationDate && (
            <Text style={editProfile.errorText}>
              {(errors as any).verification.verificationDate.message}
            </Text>
          )}
          <Text style={editProfile.helpText}>
            Date when verification was completed
          </Text>
        </View>
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
};
