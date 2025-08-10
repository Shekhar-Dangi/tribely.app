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

interface MembershipPlansEditorProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

export default function MembershipPlansEditor({
  control,
  errors,
}: MembershipPlansEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "membershipPlans",
  });

  const addMembershipPlan = () => {
    append({
      name: "",
      price: 0,
      duration: "",
      features: [""],
    });
  };

  return (
    <View style={onboard.card}>
      <Text style={onboard.cardTitle}>Membership Plans</Text>
      <Text style={editProfile.helpText}>
        Create membership plans for your gym
      </Text>

      {fields.map((field, index) => (
        <MembershipPlanCard
          key={field.id}
          control={control}
          errors={errors}
          index={index}
          onRemove={() => remove(index)}
          canRemove={fields.length > 1}
        />
      ))}

      <TouchableOpacity style={onboard.addButton} onPress={addMembershipPlan}>
        <Text style={onboard.addButtonText}>+ Add Membership Plan</Text>
      </TouchableOpacity>
    </View>
  );
}

interface MembershipPlanCardProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}

function MembershipPlanCard({
  control,
  errors,
  index,
  onRemove,
  canRemove,
}: MembershipPlanCardProps) {
  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control,
    name: `membershipPlans.${index}.features`,
  });

  const addFeature = () => {
    appendFeature("");
  };

  return (
    <View style={[onboard.card, { marginBottom: 16, position: "relative" }]}>
      {canRemove && (
        <TouchableOpacity style={union.removeButton} onPress={onRemove}>
          <Ionicons name="close-circle" size={24} color={COLORS.error} />
        </TouchableOpacity>
      )}

      <Text style={onboard.cardTitle}>Plan {index + 1}</Text>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Plan Name</Text>
        <Controller
          control={control}
          name={`membershipPlans.${index}.name`}
          rules={{ required: "Plan name is required" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={union.textInput}
              value={value || ""}
              onChangeText={onChange}
              placeholder="e.g., Basic, Premium, Annual"
              placeholderTextColor={COLORS.textMuted}
            />
          )}
        />
        {(errors as any)?.membershipPlans?.[index]?.name && (
          <Text style={editProfile.errorText}>
            {(errors as any).membershipPlans[index].name.message}
          </Text>
        )}
      </View>

      <View style={union.flexRow}>
        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Price ($)</Text>
          <Controller
            control={control}
            name={`membershipPlans.${index}.price`}
            rules={{
              required: "Price is required",
              min: {
                value: 0,
                message: "Price cannot be negative",
              },
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: "Please enter a valid price",
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
                  placeholder="29.99"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                />
              </View>
            )}
          />
          {(errors as any)?.membershipPlans?.[index]?.price && (
            <Text style={editProfile.errorText}>
              {(errors as any).membershipPlans[index].price.message}
            </Text>
          )}
        </View>

        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Duration</Text>
          <Controller
            control={control}
            name={`membershipPlans.${index}.duration`}
            rules={{ required: "Duration is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={union.textInput}
                value={value || ""}
                onChangeText={onChange}
                placeholder="1 month, 6 months, 1 year"
                placeholderTextColor={COLORS.textMuted}
              />
            )}
          />
          {(errors as any)?.membershipPlans?.[index]?.duration && (
            <Text style={editProfile.errorText}>
              {(errors as any).membershipPlans[index].duration.message}
            </Text>
          )}
        </View>
      </View>

      <View style={union.textInputContainer}>
        <Text style={union.textInputLabel}>Features</Text>
        {featureFields.map((featureField, featureIndex) => (
          <View
            key={featureField.id}
            style={[union.textInputContainer, { position: "relative" }]}
          >
            <Controller
              control={control}
              name={`membershipPlans.${index}.features.${featureIndex}`}
              rules={{ required: "Feature description is required" }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={union.textInput}
                  value={value || ""}
                  onChangeText={onChange}
                  placeholder="e.g., Access to all equipment, Group classes"
                  placeholderTextColor={COLORS.textMuted}
                />
              )}
            />
            {featureFields.length > 1 && (
              <TouchableOpacity
                style={union.removeButton}
                onPress={() => removeFeature(featureIndex)}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.error} />
              </TouchableOpacity>
            )}
            {(errors as any)?.membershipPlans?.[index]?.features?.[
              featureIndex
            ] && (
              <Text style={editProfile.errorText}>
                {
                  (errors as any).membershipPlans[index].features[featureIndex]
                    ?.message
                }
              </Text>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[onboard.addButton, { marginTop: 8, paddingVertical: 8 }]}
          onPress={addFeature}
        >
          <Text style={[onboard.addButtonText, { fontSize: 14 }]}>
            + Add Feature
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = {
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
