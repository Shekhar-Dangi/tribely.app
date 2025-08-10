import React from "react";
import { View, Text, TextInput } from "react-native";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { COLORS } from "@/constants/theme";
import { union, onboard, editProfile } from "@/constants/styles";

interface BusinessInfoEditorProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

export default function BusinessInfoEditor({
  control,
  errors,
}: BusinessInfoEditorProps) {
  return (
    <View style={onboard.wideCard}>
      <Text style={onboard.cardTitle}>Business Information</Text>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Business Address</Text>
        <Controller
          control={control}
          name="businessInfo.address"
          rules={{
            required: "Business address is required",
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[union.textInput, editProfile.bioInput]}
              value={value || ""}
              onChangeText={onChange}
              placeholder="Enter your gym's full address"
              placeholderTextColor={COLORS.textMuted}
              multiline
              textAlignVertical="top"
            />
          )}
        />
        {(errors as any)?.businessInfo?.address && (
          <Text style={editProfile.errorText}>
            {(errors as any).businessInfo.address.message}
          </Text>
        )}
        <Text style={editProfile.helpText}>
          Include street address, city, state, and zip code
        </Text>
      </View>

      <View style={union.flexRow}>
        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Phone Number</Text>
          <Controller
            control={control}
            name="businessInfo.phone"
            rules={{
              pattern: {
                value: /^[\+]?[1-9][\d]{0,15}$/,
                message: "Please enter a valid phone number",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={union.textInput}
                value={value || ""}
                onChangeText={onChange}
                placeholder="(555) 123-4567"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
              />
            )}
          />
          {(errors as any)?.businessInfo?.phone && (
            <Text style={editProfile.errorText}>
              {(errors as any).businessInfo.phone.message}
            </Text>
          )}
        </View>

        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Website</Text>
          <Controller
            control={control}
            name="businessInfo.website"
            rules={{
              pattern: {
                value: /^https?:\/\/.+\..+/,
                message: "Please enter a valid website URL",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={union.textInput}
                value={value || ""}
                onChangeText={onChange}
                placeholder="https://mygym.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="url"
                autoCapitalize="none"
              />
            )}
          />
          {(errors as any)?.businessInfo?.website && (
            <Text style={editProfile.errorText}>
              {(errors as any).businessInfo.website.message}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
