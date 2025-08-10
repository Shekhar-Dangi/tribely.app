import React from "react";
import { View, Text, TextInput } from "react-native";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { COLORS } from "@/constants/theme";
import { union, onboard, editProfile } from "@/constants/styles";

interface BrandBusinessInfoEditorProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

export default function BrandBusinessInfoEditor({
  control,
  errors,
}: BrandBusinessInfoEditorProps) {
  return (
    <View style={onboard.card}>
      <Text style={onboard.cardTitle}>Business Information</Text>

      <View style={union.flexRow}>
        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Company Size</Text>
          <Controller
            control={control}
            name="brandBusinessInfo.companySize"
            rules={{ required: "Company size is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={union.textInput}
                value={value || ""}
                onChangeText={onChange}
                placeholder="e.g., 1-10, 11-50, 51-200, 201-500, 501+"
                placeholderTextColor={COLORS.textMuted}
              />
            )}
          />
          {(errors as any)?.brandBusinessInfo?.companySize && (
            <Text style={editProfile.errorText}>
              {(errors as any).brandBusinessInfo.companySize.message}
            </Text>
          )}
          <Text style={editProfile.helpText}>
            Enter your company size range (e.g., &ldquo;1-10&rdquo;,
            &ldquo;11-50&rdquo;, &ldquo;501+&rdquo;)
          </Text>
        </View>

        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Industry</Text>
          <Controller
            control={control}
            name="brandBusinessInfo.industry"
            rules={{ required: "Industry is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={union.textInput}
                value={value || ""}
                onChangeText={onChange}
                placeholder="e.g., Sports & Fitness, Nutrition, Apparel"
                placeholderTextColor={COLORS.textMuted}
              />
            )}
          />
          {(errors as any)?.brandBusinessInfo?.industry && (
            <Text style={editProfile.errorText}>
              {(errors as any).brandBusinessInfo.industry.message}
            </Text>
          )}
        </View>
      </View>

      <View style={union.flexRow}>
        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Website</Text>
          <Controller
            control={control}
            name="brandBusinessInfo.website"
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
                placeholder="https://yourbrand.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="url"
                autoCapitalize="none"
              />
            )}
          />
          {(errors as any)?.brandBusinessInfo?.website && (
            <Text style={editProfile.errorText}>
              {(errors as any).brandBusinessInfo.website.message}
            </Text>
          )}
        </View>

        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Headquarters</Text>
          <Controller
            control={control}
            name="brandBusinessInfo.headquarters"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={union.textInput}
                value={value || ""}
                onChangeText={onChange}
                placeholder="City, State/Country"
                placeholderTextColor={COLORS.textMuted}
              />
            )}
          />
        </View>
      </View>

      {/* Contact Information Section */}
      <View style={[onboard.card, { marginTop: 16, marginBottom: 0 }]}>
        <Text style={onboard.cardTitle}>Contact Information</Text>

        <View style={union.textInputContainer}>
          <Text style={union.textInputLabel}>Business Email</Text>
          <Controller
            control={control}
            name="brandBusinessInfo.contactInfo.email"
            rules={{
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={union.textInput}
                value={value || ""}
                onChangeText={onChange}
                placeholder="contact@yourbrand.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
          {(errors as any)?.brandBusinessInfo?.contactInfo?.email && (
            <Text style={editProfile.errorText}>
              {(errors as any).brandBusinessInfo.contactInfo.email.message}
            </Text>
          )}
        </View>

        <View style={union.flexRow}>
          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Business Phone</Text>
            <Controller
              control={control}
              name="brandBusinessInfo.contactInfo.phone"
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
            {(errors as any)?.brandBusinessInfo?.contactInfo?.phone && (
              <Text style={editProfile.errorText}>
                {(errors as any).brandBusinessInfo.contactInfo.phone.message}
              </Text>
            )}
          </View>

          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Business Address</Text>
            <Controller
              control={control}
              name="brandBusinessInfo.contactInfo.address"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={union.textInput}
                  value={value || ""}
                  onChangeText={onChange}
                  placeholder="123 Business St, City, State"
                  placeholderTextColor={COLORS.textMuted}
                />
              )}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
