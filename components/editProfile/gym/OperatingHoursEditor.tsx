import React from "react";
import { View, Text, TextInput } from "react-native";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { COLORS } from "@/constants/theme";
import { union, onboard, editProfile } from "@/constants/styles";

interface OperatingHoursEditorProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

const days = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export default function OperatingHoursEditor({
  control,
  errors,
}: OperatingHoursEditorProps) {
  return (
    <View style={onboard.card}>
      <Text style={onboard.cardTitle}>Operating Hours</Text>
      <Text style={editProfile.helpText}>
        Enter hours in format: &ldquo;6:00 AM - 10:00 PM&rdquo; or
        &ldquo;Closed&rdquo;
      </Text>

      {days.map((day) => (
        <View key={day.key} style={union.textInputContainer}>
          <Text style={union.textInputLabel}>{day.label}</Text>
          <Controller
            control={control}
            name={`businessInfo.operatingHours.${day.key}`}
            rules={{
              pattern: {
                value:
                  /^((\d{1,2}:\d{2}\s?(AM|PM)\s?-\s?\d{1,2}:\d{2}\s?(AM|PM))|Closed)$/i,
                message: "Use format: '6:00 AM - 10:00 PM' or 'Closed'",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={union.textInput}
                value={value || ""}
                onChangeText={onChange}
                placeholder="6:00 AM - 10:00 PM"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="words"
              />
            )}
          />
          {(errors as any)?.businessInfo?.operatingHours?.[day.key] && (
            <Text style={editProfile.errorText}>
              {(errors as any).businessInfo.operatingHours[day.key].message}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
