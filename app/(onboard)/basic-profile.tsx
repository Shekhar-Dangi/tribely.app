import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { useImageUpload } from "@/hooks/useImageUpload";

interface FormData {
  username: string;
  bio: string;
  avatarUrl?: string;
}

export default function BasicProfile() {
  const { userType } = useLocalSearchParams<{
    userType: "individual" | "gym" | "brand";
  }>();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    bio: "",
    avatarUrl: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const { isUploading, uploadImage } = useImageUpload({
    category: "avatar",
    resize: { width: 200, height: 200 },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    if (formData.bio.length > 150) {
      newErrors.bio = "Bio must be 150 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarUpload = async () => {
    Alert.alert(
      "Select Image",
      "Choose how you want to add your profile photo",
      [
        { text: "Camera", onPress: () => uploadAvatar("camera") },
        { text: "Photo Library", onPress: () => uploadAvatar("gallery") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const uploadAvatar = async (source: "camera" | "gallery") => {
    const result = await uploadImage(source);

    if (result.error) {
      Alert.alert("Upload Error", result.error);
    } else if (result.fileUrl) {
      setFormData((prev) => ({ ...prev, avatarUrl: result.fileUrl }));
    }
  };

  const handleNext = () => {
    if (!validateForm()) return;

    // Navigate to appropriate next screen based on user type
    const nextRoute =
      userType === "individual"
        ? "/(onboard)/individual/stats"
        : userType === "gym"
          ? "/(onboard)/gym/business"
          : "/(onboard)/brand/company";

    router.push({
      pathname: nextRoute as any,
      params: {
        userType,
        ...formData,
      },
    });
  };

  const getUserTypeDisplayName = () => {
    switch (userType) {
      case "individual":
        return "Personal";
      case "gym":
        return "Gym";
      case "brand":
        return "Brand";
      default:
        return "Profile";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "33%" }]} />
              </View>
              <Text style={styles.progressText}>Step 2 of 4</Text>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>
              Basic {getUserTypeDisplayName()} Info
            </Text>
            <Text style={styles.subtitle}>
              Let&apos;s set up your profile with some basic information
            </Text>

            {/* Avatar Upload */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={handleAvatarUpload}
                disabled={isUploading}
              >
                {formData.avatarUrl ? (
                  <Image
                    source={{ uri: formData.avatarUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons
                      name="camera"
                      size={32}
                      color={COLORS.textSecondary}
                    />
                  </View>
                )}
                {isUploading && (
                  <View style={styles.uploadingOverlay}>
                    <Text style={styles.uploadingText}>Uploading...</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Tap to add profile photo</Text>
            </View>

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username *</Text>
              <TextInput
                style={[styles.input, errors.username && styles.inputError]}
                value={formData.username}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, username: text }));
                  if (errors.username) {
                    setErrors((prev) => ({ ...prev, username: undefined }));
                  }
                }}
                placeholder="Enter your username"
                placeholderTextColor={COLORS.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}
            </View>

            {/* Bio Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  errors.bio && styles.inputError,
                ]}
                value={formData.bio}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, bio: text }));
                  if (errors.bio) {
                    setErrors((prev) => ({ ...prev, bio: undefined }));
                  }
                }}
                placeholder={`Tell others about your ${userType === "individual" ? "fitness journey" : userType}`}
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={4}
                maxLength={150}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {formData.bio.length}/150
              </Text>
              {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    marginLeft: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 30,
    lineHeight: 22,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.mediumGray,
    borderStyle: "dashed",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  avatarHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: "white",
  },
  inputError: {
    borderColor: COLORS.error,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "right",
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
