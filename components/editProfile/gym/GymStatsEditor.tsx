import React from "react";
import { View, Text, TextInput } from "react-native";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { COLORS } from "@/constants/theme";
import { union, onboard, editProfile } from "@/constants/styles";

interface GymStatsEditorProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

export default function GymStatsEditor({
  control,
  errors,
}: GymStatsEditorProps) {
  return (
    <View style={onboard.card}>
      <Text style={onboard.cardTitle}>Gym Statistics</Text>
      <Text style={editProfile.helpText}>
        Provide key statistics about your gym
      </Text>

      <View style={union.flexRow}>
        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Member Count</Text>
          <Controller
            control={control}
            name="stats.memberCount"
            rules={{
              required: "Member count is required",
              min: {
                value: 0,
                message: "Member count cannot be negative",
              },
              pattern: {
                value: /^\d+$/,
                message: "Please enter a valid number",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={union.textInput}
                value={value?.toString() || ""}
                onChangeText={(text) =>
                  onChange(text ? parseInt(text, 10) : undefined)
                }
                placeholder="150"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />
            )}
          />
          {(errors as any)?.stats?.memberCount && (
            <Text style={editProfile.errorText}>
              {(errors as any).stats.memberCount.message}
            </Text>
          )}
        </View>

        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Trainer Count</Text>
          <Controller
            control={control}
            name="stats.trainerCount"
            rules={{
              required: "Trainer count is required",
              min: {
                value: 0,
                message: "Trainer count cannot be negative",
              },
              pattern: {
                value: /^\d+$/,
                message: "Please enter a valid number",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={union.textInput}
                value={value?.toString() || ""}
                onChangeText={(text) =>
                  onChange(text ? parseInt(text, 10) : undefined)
                }
                placeholder="8"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />
            )}
          />
          {(errors as any)?.stats?.trainerCount && (
            <Text style={editProfile.errorText}>
              {(errors as any).stats.trainerCount.message}
            </Text>
          )}
        </View>
      </View>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Equipment Count (Optional)</Text>
        <Controller
          control={control}
          name="stats.equipmentCount"
          rules={{
            min: {
              value: 0,
              message: "Equipment count cannot be negative",
            },
            pattern: {
              value: /^\d+$/,
              message: "Please enter a valid number",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={union.textInput}
              value={value?.toString() || ""}
              onChangeText={(text) =>
                onChange(text ? parseInt(text, 10) : undefined)
              }
              placeholder="50"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
            />
          )}
        />
        {(errors as any)?.stats?.equipmentCount && (
          <Text style={editProfile.errorText}>
            {(errors as any).stats.equipmentCount.message}
          </Text>
        )}
        <Text style={editProfile.helpText}>
          Total number of equipment pieces available
        </Text>
      </View>
    </View>
  );
}
