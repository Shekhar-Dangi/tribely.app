import React from "react";
import { View, Text, TextInput, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Controller, Control, FieldErrors, useWatch } from "react-hook-form";
import { union } from "@/constants/styles";
import { COLORS } from "@/constants/theme";

interface Certification {
  title: string;
  subtitle: string;
  description: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  isActive: boolean;
}

interface CertificationsForm {
  certifications: Certification[];
}

interface CertificationCardProps {
  certification: Certification;
  index: number;
  control: Control<CertificationsForm>;
  errors: FieldErrors<CertificationsForm>;
  onRemove: () => void;
  showRemove: boolean;
}

export default function CertificationCard({
  certification,
  index,
  control,
  errors,
  onRemove,
  showRemove,
}: CertificationCardProps) {
  // Watch the current certification values to implement conditional validation
  const currentCertification = useWatch({
    control,
    name: `certifications.${index}`,
  });

  // Check if any field in this certification has content (to trigger "all or nothing" rule)
  const hasAnyContent =
    currentCertification?.title ||
    currentCertification?.subtitle ||
    currentCertification?.description ||
    currentCertification?.issueDate ||
    currentCertification?.expiryDate ||
    currentCertification?.credentialId ||
    currentCertification?.isActive;

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
        Certification #{index + 1}
      </Text>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Certification Name *</Text>
        <Controller
          control={control}
          name={`certifications.${index}.title`}
          rules={{
            validate: (value) => {
              if (hasAnyContent && !value) {
                return "Certification name is required when certification is filled";
              }
              return true;
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={union.textInput}
              value={value}
              onChangeText={onChange}
              placeholder="e.g., ACSM Personal Trainer"
            />
          )}
        />
        {errors.certifications?.[index]?.title && (
          <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
            {errors.certifications[index]?.title?.message}
          </Text>
        )}
      </View>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Issuing Organization *</Text>
        <Controller
          control={control}
          name={`certifications.${index}.subtitle`}
          rules={{
            validate: (value) => {
              if (hasAnyContent && !value) {
                return "Issuing organization is required when certification is filled";
              }
              return true;
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={union.textInput}
              value={value}
              onChangeText={onChange}
              placeholder="e.g., NASM, ACE, ACSM"
            />
          )}
        />
        {errors.certifications?.[index]?.subtitle && (
          <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
            {errors.certifications[index]?.subtitle?.message}
          </Text>
        )}
      </View>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Description</Text>
        <Controller
          control={control}
          name={`certifications.${index}.description`}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[
                union.textInput,
                { height: 80, textAlignVertical: "top" },
              ]}
              value={value}
              onChangeText={onChange}
              placeholder="Describe what this certification covers..."
              multiline
            />
          )}
        />
      </View>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Credential ID</Text>
        <Controller
          control={control}
          name={`certifications.${index}.credentialId`}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={union.textInput}
              value={value}
              onChangeText={onChange}
              placeholder="Certificate number"
            />
          )}
        />
      </View>

      <View style={union.flexRow}>
        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Issue Date *</Text>
          <Controller
            control={control}
            name={`certifications.${index}.issueDate`}
            rules={{
              validate: (value) => {
                if (hasAnyContent && !value) {
                  return "Issue date is required when certification is filled";
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
          {errors.certifications?.[index]?.issueDate && (
            <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
              {errors.certifications[index]?.issueDate?.message}
            </Text>
          )}
        </View>

        <Controller
          control={control}
          name={`certifications.${index}.isActive`}
          render={({ field: { onChange, value } }) => (
            <>
              {!value && (
                <View style={union.textInputContainer}>
                  <Text style={union.textInputLabel}>Expiry Date</Text>
                  <Controller
                    control={control}
                    name={`certifications.${index}.expiryDate`}
                    rules={{
                      validate: (expiryValue) => {
                        if (
                          hasAnyContent &&
                          !currentCertification?.isActive &&
                          !expiryValue
                        ) {
                          return "Expiry date is required when certification is filled (unless no expiry)";
                        }
                        if (
                          expiryValue &&
                          !/^(0[1-9]|1[0-2])-\d{4}$/.test(expiryValue)
                        ) {
                          return "Please enter date in MM-YYYY format";
                        }
                        return true;
                      },
                    }}
                    render={({
                      field: { onChange: onExpiryChange, value: expiryValue },
                    }) => (
                      <TextInput
                        style={union.textInput}
                        value={expiryValue}
                        onChangeText={onExpiryChange}
                        placeholder="MM-YYYY"
                        maxLength={7}
                      />
                    )}
                  />
                  {errors.certifications?.[index]?.expiryDate && (
                    <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                      {errors.certifications[index]?.expiryDate?.message}
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
        name={`certifications.${index}.isActive`}
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
              No expiry date
            </Text>
          </View>
        )}
      />
    </View>
  );
}
