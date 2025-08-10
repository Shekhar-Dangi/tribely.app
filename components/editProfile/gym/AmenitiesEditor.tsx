import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import {
  Controller,
  Control,
  FieldErrors,
  useFieldArray,
} from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { union, onboard, editProfile } from "@/constants/styles";

interface AmenitiesEditorProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

export default function AmenitiesEditor({
  control,
  errors,
}: AmenitiesEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "businessInfo.amenities",
  });

  const addAmenity = () => {
    append("");
  };

  return (
    <View style={onboard.wideCard}>
      <Text style={onboard.cardTitle}>Amenities & Equipment</Text>
      <Text style={editProfile.helpText}>
        List the amenities and equipment available at your gym
      </Text>

      {fields.map((field, index) => (
        <View
          key={field.id}
          style={[union.textInputContainer, { position: "relative" }]}
        >
          <Text style={union.textInputLabel}>Amenity {index + 1}</Text>
          <Controller
            control={control}
            name={`businessInfo.amenities.${index}`}
            rules={{ required: "Amenity description is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={union.textInput}
                value={value || ""}
                onChangeText={onChange}
                placeholder="e.g., Free weights, Cardio machines, Pool, Sauna"
                placeholderTextColor={COLORS.textMuted}
              />
            )}
          />
          {fields.length > 1 && (
            <TouchableOpacity
              style={union.removeButton}
              onPress={() => remove(index)}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.error} />
            </TouchableOpacity>
          )}
          {(errors as any)?.businessInfo?.amenities?.[index] && (
            <Text style={editProfile.errorText}>
              {(errors as any).businessInfo.amenities[index]?.message}
            </Text>
          )}
        </View>
      ))}

      <TouchableOpacity style={onboard.addButton} onPress={addAmenity}>
        <Text style={onboard.addButtonText}>+ Add Amenity</Text>
      </TouchableOpacity>
    </View>
  );
}
