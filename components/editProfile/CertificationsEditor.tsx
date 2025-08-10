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

interface CertificationsEditorProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

export default function CertificationsEditor({
  control,
  errors,
}: CertificationsEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "certifications",
  });

  const addCertification = () => {
    append({
      title: "",
      subtitle: "",
      description: "",
      logoUrl: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      isActive: true,
    });
  };

  const removeCertification = (index: number) => {
    remove(index);
  };

  return (
    <View style={onboard.card}>
      <Text style={onboard.cardTitle}>Certifications</Text>

      {fields.length === 0 && (
        <Text style={editProfile.helpText}>
          Add your professional certifications, licenses, and credentials
        </Text>
      )}

      {fields.map((field, index) => (
        <View
          key={field.id}
          style={[onboard.card, { marginBottom: 16, position: "relative" }]}
        >
          <TouchableOpacity
            style={union.removeButton}
            onPress={() => removeCertification(index)}
          >
            <Ionicons name="close" size={16} color={COLORS.error} />
          </TouchableOpacity>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Certification Title *</Text>
            <Controller
              control={control}
              name={`certifications.${index}.title`}
              rules={{ required: "Certification title is required" }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={union.textInput}
                  value={value || ""}
                  onChangeText={onChange}
                  placeholder="e.g., NASM Certified Personal Trainer"
                  placeholderTextColor={COLORS.textMuted}
                />
              )}
            />
            {(errors as any)?.certifications?.[index]?.title && (
              <Text style={editProfile.errorText}>
                {(errors as any).certifications[index].title.message}
              </Text>
            )}
          </View>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Issuing Organization</Text>
            <Controller
              control={control}
              name={`certifications.${index}.subtitle`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={union.textInput}
                  value={value || ""}
                  onChangeText={onChange}
                  placeholder="e.g., National Academy of Sports Medicine"
                  placeholderTextColor={COLORS.textMuted}
                />
              )}
            />
          </View>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Description</Text>
            <Controller
              control={control}
              name={`certifications.${index}.description`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[union.textInput, editProfile.bioInput]}
                  value={value || ""}
                  onChangeText={onChange}
                  placeholder="Brief description of the certification..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={2}
                />
              )}
            />
          </View>

          <View style={union.flexRow}>
            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>Issue Date</Text>
              <Controller
                control={control}
                name={`certifications.${index}.issueDate`}
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
              {(errors as any)?.certifications?.[index]?.issueDate && (
                <Text style={editProfile.errorText}>
                  {(errors as any).certifications[index].issueDate.message}
                </Text>
              )}
            </View>

            <View style={union.textInputContainer}>
              <Text style={union.textInputLabel}>Expiry Date</Text>
              <Controller
                control={control}
                name={`certifications.${index}.expiryDate`}
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
              {(errors as any)?.certifications?.[index]?.expiryDate && (
                <Text style={editProfile.errorText}>
                  {(errors as any).certifications[index].expiryDate.message}
                </Text>
              )}
            </View>
          </View>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Credential ID</Text>
            <Controller
              control={control}
              name={`certifications.${index}.credentialId`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={union.textInput}
                  value={value || ""}
                  onChangeText={onChange}
                  placeholder="e.g., NASM-CPT-123456"
                  placeholderTextColor={COLORS.textMuted}
                />
              )}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={union.textInputLabel}>Currently Active</Text>
            <Controller
              control={control}
              name={`certifications.${index}.isActive`}
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value !== false} // Default to true
                  onValueChange={onChange}
                  trackColor={{
                    false: COLORS.lightGray,
                    true: COLORS.secondary,
                  }}
                  thumbColor={value !== false ? COLORS.white : COLORS.textMuted}
                />
              )}
            />
          </View>
        </View>
      ))}

      <TouchableOpacity style={onboard.addButton} onPress={addCertification}>
        <Text style={onboard.addButtonText}>+ Add Certification</Text>
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
