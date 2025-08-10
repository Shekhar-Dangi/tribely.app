import React from "react";
import { View, Text, TextInput, TouchableOpacity, Switch } from "react-native";
import {
  Controller,
  Control,
  FieldErrors,
  useFieldArray,
} from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { union, onboard, editProfile } from "@/constants/styles";

interface PartnershipsEditorProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

const partnerTypes = [
  { value: "individual", label: "Individual Trainer/Athlete" },
  { value: "gym", label: "Gym/Fitness Center" },
  { value: "brand", label: "Brand/Company" },
];

export default function PartnershipsEditor({
  control,
  errors,
}: PartnershipsEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "brandPartnerships",
  });

  const addPartnership = () => {
    append({
      partnerName: "",
      partnerType: "individual",
      partnership_type: "",
      startDate: "",
      endDate: "",
      isActive: true,
    });
  };

  return (
    <View style={onboard.card}>
      <Text style={onboard.cardTitle}>Partnerships</Text>
      <Text style={editProfile.helpText}>
        Manage your brand partnerships with gyms, trainers, and other brands
      </Text>

      {fields.map((field, index) => (
        <PartnershipCard
          key={field.id}
          control={control}
          errors={errors}
          index={index}
          onRemove={() => remove(index)}
          canRemove={fields.length > 1}
          partnerTypes={partnerTypes}
        />
      ))}

      <TouchableOpacity style={onboard.addButton} onPress={addPartnership}>
        <Text style={onboard.addButtonText}>+ Add Partnership</Text>
      </TouchableOpacity>
    </View>
  );
}

interface PartnershipCardProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  partnerTypes: { value: string; label: string }[];
}

function PartnershipCard({
  control,
  errors,
  index,
  onRemove,
  canRemove,
  partnerTypes,
}: PartnershipCardProps) {
  return (
    <View style={[onboard.card, { marginBottom: 16, position: "relative" }]}>
      {canRemove && (
        <TouchableOpacity style={union.removeButton} onPress={onRemove}>
          <Ionicons name="close-circle" size={24} color={COLORS.error} />
        </TouchableOpacity>
      )}

      <Text style={onboard.cardTitle}>Partnership {index + 1}</Text>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Partner Name</Text>
        <Controller
          control={control}
          name={`brandPartnerships.${index}.partnerName`}
          rules={{ required: "Partner name is required" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={union.textInput}
              value={value || ""}
              onChangeText={onChange}
              placeholder="e.g., FitLife Gym, John Smith Training"
              placeholderTextColor={COLORS.textMuted}
            />
          )}
        />
        {(errors as any)?.brandVerification?.partnerships?.[index]
          ?.partnerName && (
          <Text style={editProfile.errorText}>
            {(errors as any).brandPartnerships[index].partnerName.message}
          </Text>
        )}
      </View>

      <View style={union.flexRow}>
        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Partner Type</Text>
          <Controller
            control={control}
            name={`brandPartnerships.${index}.partnerType`}
            rules={{ required: "Partner type is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={union.textInput}
                value={value || ""}
                onChangeText={onChange}
                placeholder="individual, gym, or brand"
                placeholderTextColor={COLORS.textMuted}
              />
            )}
          />
          {(errors as any)?.brandVerification?.partnerships?.[index]
            ?.partnerType && (
            <Text style={editProfile.errorText}>
              {(errors as any).brandPartnerships[index].partnerType.message}
            </Text>
          )}
          <Text style={editProfile.helpText}>
            Enter: individual, gym, or brand
          </Text>
        </View>

        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Partnership Type</Text>
          <Controller
            control={control}
            name={`brandPartnerships.${index}.partnership_type`}
            rules={{ required: "Partnership type is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={union.textInput}
                value={value || ""}
                onChangeText={onChange}
                placeholder="Sponsorship, Collaboration, etc."
                placeholderTextColor={COLORS.textMuted}
              />
            )}
          />
          {(errors as any)?.brandVerification?.partnerships?.[index]
            ?.partnership_type && (
            <Text style={editProfile.errorText}>
              {
                (errors as any).brandPartnerships[index].partnership_type
                  .message
              }
            </Text>
          )}
        </View>
      </View>

      <View style={union.flexRow}>
        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Start Date</Text>
          <Controller
            control={control}
            name={`brandPartnerships.${index}.startDate`}
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
          {(errors as any)?.brandVerification?.partnerships?.[index]
            ?.startDate && (
            <Text style={editProfile.errorText}>
              {(errors as any).brandPartnerships[index].startDate.message}
            </Text>
          )}
        </View>

        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>End Date (Optional)</Text>
          <Controller
            control={control}
            name={`brandPartnerships.${index}.endDate`}
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
          {(errors as any)?.brandVerification?.partnerships?.[index]
            ?.endDate && (
            <Text style={editProfile.errorText}>
              {(errors as any).brandPartnerships[index].endDate.message}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.switchContainer}>
        <View style={styles.switchTextContainer}>
          <Text style={union.textInputLabel}>Active Partnership</Text>
          <Text style={editProfile.helpText}>
            Is this partnership currently active?
          </Text>
        </View>
        <Controller
          control={control}
          name={`brandPartnerships.${index}.isActive`}
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
    </View>
  );
}

const styles = {
  switchContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 12,
    marginBottom: 8,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 16,
  },
};
