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

interface CampaignsEditorProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

export default function CampaignsEditor({
  control,
  errors,
}: CampaignsEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "brandCampaigns",
  });

  const addCampaign = () => {
    append({
      title: "",
      description: "",
      targetAudience: "",
      startDate: "",
      endDate: "",
      isActive: true,
    });
  };

  return (
    <View style={onboard.card}>
      <Text style={onboard.cardTitle}>Marketing Campaigns</Text>
      <Text style={editProfile.helpText}>
        Track and manage your marketing campaigns and initiatives
      </Text>

      {fields.map((field, index) => (
        <CampaignCard
          key={field.id}
          control={control}
          errors={errors}
          index={index}
          onRemove={() => remove(index)}
          canRemove={fields.length > 1}
        />
      ))}

      <TouchableOpacity style={onboard.addButton} onPress={addCampaign}>
        <Text style={onboard.addButtonText}>+ Add Campaign</Text>
      </TouchableOpacity>
    </View>
  );
}

interface CampaignCardProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}

function CampaignCard({
  control,
  errors,
  index,
  onRemove,
  canRemove,
}: CampaignCardProps) {
  return (
    <View style={[onboard.card, { marginBottom: 16, position: "relative" }]}>
      {canRemove && (
        <TouchableOpacity style={union.removeButton} onPress={onRemove}>
          <Ionicons name="close-circle" size={24} color={COLORS.error} />
        </TouchableOpacity>
      )}

      <Text style={onboard.cardTitle}>Campaign {index + 1}</Text>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Campaign Title</Text>
        <Controller
          control={control}
          name={`brandCampaigns.${index}.title`}
          rules={{ required: "Campaign title is required" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={union.textInput}
              value={value || ""}
              onChangeText={onChange}
              placeholder="e.g., Summer Fitness Challenge 2024"
              placeholderTextColor={COLORS.textMuted}
            />
          )}
        />
        {(errors as any)?.campaigns?.[index]?.title && (
          <Text style={editProfile.errorText}>
            {(errors as any).brandCampaigns[index].title.message}
          </Text>
        )}
      </View>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Campaign Description</Text>
        <Controller
          control={control}
          name={`brandCampaigns.${index}.description`}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[union.textInput, editProfile.bioInput]}
              value={value || ""}
              onChangeText={onChange}
              placeholder="Describe your marketing campaign objectives and approach"
              placeholderTextColor={COLORS.textMuted}
              multiline
              textAlignVertical="top"
            />
          )}
        />
        {(errors as any)?.campaigns?.[index]?.description && (
          <Text style={editProfile.errorText}>
            {(errors as any).brandCampaigns[index].description.message}
          </Text>
        )}
      </View>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Target Audience</Text>
        <Controller
          control={control}
          name={`brandCampaigns.${index}.targetAudience`}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={union.textInput}
              value={value || ""}
              onChangeText={onChange}
              placeholder="e.g., Fitness enthusiasts 18-35, Gym owners, Athletes"
              placeholderTextColor={COLORS.textMuted}
            />
          )}
        />
        {(errors as any)?.campaigns?.[index]?.targetAudience && (
          <Text style={editProfile.errorText}>
            {(errors as any).brandCampaigns[index].targetAudience.message}
          </Text>
        )}
      </View>

      <View style={union.flexRow}>
        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Start Date</Text>
          <Controller
            control={control}
            name={`brandCampaigns.${index}.startDate`}
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
          {(errors as any)?.campaigns?.[index]?.startDate && (
            <Text style={editProfile.errorText}>
              {(errors as any).brandCampaigns[index].startDate.message}
            </Text>
          )}
        </View>

        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>End Date (Optional)</Text>
          <Controller
            control={control}
            name={`brandCampaigns.${index}.endDate`}
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
          {(errors as any)?.campaigns?.[index]?.endDate && (
            <Text style={editProfile.errorText}>
              {(errors as any).brandCampaigns[index].endDate.message}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.switchContainer}>
        <View style={styles.switchTextContainer}>
          <Text style={union.textInputLabel}>Active Campaign</Text>
          <Text style={editProfile.helpText}>
            Is this campaign currently running?
          </Text>
        </View>
        <Controller
          control={control}
          name={`brandCampaigns.${index}.isActive`}
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
