import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { useImageUpload } from "@/hooks/useImageUpload";

interface PersonalRecord {
  exerciseName: string;
  subtitle: string;
  date: string;
  imageUrl?: string;
}

interface StatsFormData {
  height: string;
  weight: string;
  bodyFat: string;
  personalRecords: PersonalRecord[];
}

export default function IndividualStats() {
  const params = useLocalSearchParams();
  const [formData, setFormData] = useState<StatsFormData>({
    height: "",
    weight: "",
    bodyFat: "",
    personalRecords: [
      { exerciseName: "", subtitle: "", date: "", imageUrl: "" },
    ],
  });
  const [errors, setErrors] = useState<any>({});

  const { isUploading, uploadImage } = useImageUpload({
    category: "personalRecord",
  });

  const addPersonalRecord = () => {
    setFormData((prev) => ({
      ...prev,
      personalRecords: [
        ...prev.personalRecords,
        { exerciseName: "", subtitle: "", date: "", imageUrl: "" },
      ],
    }));
  };

  const updatePersonalRecord = (
    index: number,
    field: keyof PersonalRecord,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      personalRecords: prev.personalRecords.map((pr, i) =>
        i === index ? { ...pr, [field]: value } : pr
      ),
    }));
  };

  const removePersonalRecord = (index: number) => {
    if (formData.personalRecords.length > 1) {
      setFormData((prev) => ({
        ...prev,
        personalRecords: prev.personalRecords.filter((_, i) => i !== index),
      }));
    }
  };

  const uploadPRImage = async (index: number) => {
    Alert.alert(
      "Add PR Proof",
      "Upload an image to showcase your personal record",
      [
        { text: "Camera", onPress: () => handleImageUpload(index, "camera") },
        {
          text: "Photo Library",
          onPress: () => handleImageUpload(index, "gallery"),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleImageUpload = async (
    index: number,
    source: "camera" | "gallery"
  ) => {
    const result = await uploadImage(source);

    if (result.error) {
      Alert.alert("Upload Error", result.error);
    } else if (result.fileUrl) {
      updatePersonalRecord(index, "imageUrl", result.fileUrl);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    // Basic stats validation
    if (
      formData.height &&
      (isNaN(Number(formData.height)) ||
        Number(formData.height) < 50 ||
        Number(formData.height) > 300)
    ) {
      newErrors.height = "Please enter a valid height between 50-300 cm";
    }

    if (
      formData.weight &&
      (isNaN(Number(formData.weight)) ||
        Number(formData.weight) < 20 ||
        Number(formData.weight) > 300)
    ) {
      newErrors.weight = "Please enter a valid weight between 20-300 kg";
    }

    if (
      formData.bodyFat &&
      (isNaN(Number(formData.bodyFat)) ||
        Number(formData.bodyFat) < 3 ||
        Number(formData.bodyFat) > 50)
    ) {
      newErrors.bodyFat =
        "Please enter a valid body fat percentage between 3-50%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm()) return;

    router.push({
      pathname: "/(onboard)/individual/experience" as any,
      params: {
        ...params,
        statsData: JSON.stringify(formData),
      },
    });
  };

  const handleSkip = () => {
    router.push({
      pathname: "/(onboard)/individual/experience" as any,
      params: { ...params },
    });
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
                <View style={[styles.progressFill, { width: "50%" }]} />
              </View>
              <Text style={styles.progressText}>Step 3 of 4</Text>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Personal Stats</Text>
            <Text style={styles.subtitle}>
              Share your fitness metrics and personal records to connect with
              like-minded individuals
            </Text>

            {/* Basic Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Metrics</Text>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Height (cm)</Text>
                  <TextInput
                    style={[styles.input, errors.height && styles.inputError]}
                    value={formData.height}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, height: text }))
                    }
                    placeholder="175"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="numeric"
                  />
                  {errors.height && (
                    <Text style={styles.errorText}>{errors.height}</Text>
                  )}
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.label}>Weight (kg)</Text>
                  <TextInput
                    style={[styles.input, errors.weight && styles.inputError]}
                    value={formData.weight}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, weight: text }))
                    }
                    placeholder="70"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="numeric"
                  />
                  {errors.weight && (
                    <Text style={styles.errorText}>{errors.weight}</Text>
                  )}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Body Fat % (optional)</Text>
                <TextInput
                  style={[styles.input, errors.bodyFat && styles.inputError]}
                  value={formData.bodyFat}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, bodyFat: text }))
                  }
                  placeholder="15"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="numeric"
                />
                {errors.bodyFat && (
                  <Text style={styles.errorText}>{errors.bodyFat}</Text>
                )}
              </View>
            </View>

            {/* Personal Records */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Personal Records</Text>
                <TouchableOpacity
                  onPress={addPersonalRecord}
                  style={styles.addButton}
                >
                  <Ionicons
                    name="add-circle"
                    size={24}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>

              {formData.personalRecords.map((pr, index) => (
                <View key={index} style={styles.prCard}>
                  <View style={styles.prHeader}>
                    <Text style={styles.prTitle}>PR #{index + 1}</Text>
                    {formData.personalRecords.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removePersonalRecord(index)}
                      >
                        <Ionicons name="trash" size={18} color={COLORS.error} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Exercise</Text>
                    <TextInput
                      style={styles.input}
                      value={pr.exerciseName}
                      onChangeText={(text) =>
                        updatePersonalRecord(index, "exerciseName", text)
                      }
                      placeholder="Bench Press, Deadlift, 5K Run..."
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Record</Text>
                    <TextInput
                      style={styles.input}
                      value={pr.subtitle}
                      onChangeText={(text) =>
                        updatePersonalRecord(index, "subtitle", text)
                      }
                      placeholder="120kg, 22:30, 100 reps..."
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Date Achieved</Text>
                    <TextInput
                      style={styles.input}
                      value={pr.date}
                      onChangeText={(text) =>
                        updatePersonalRecord(index, "date", text)
                      }
                      placeholder="DD-MM-YYYY"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  </View>

                  {/* Image Upload */}
                  <View style={styles.imageUploadSection}>
                    <Text style={styles.label}>Proof Image (optional)</Text>
                    {pr.imageUrl ? (
                      <View style={styles.uploadedImageContainer}>
                        <Image
                          source={{ uri: pr.imageUrl }}
                          style={styles.uploadedImage}
                        />
                        <TouchableOpacity
                          style={styles.changeImageButton}
                          onPress={() => uploadPRImage(index)}
                        >
                          <Text style={styles.changeImageText}>Change</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => uploadPRImage(index)}
                        disabled={isUploading}
                      >
                        <Ionicons
                          name="camera"
                          size={20}
                          color={COLORS.primary}
                        />
                        <Text style={styles.uploadButtonText}>
                          {isUploading ? "Uploading..." : "Add Photo"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
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
    paddingBottom: 20,
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
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
  },
  addButton: {
    padding: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
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
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  prCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  prHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  prTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  imageUploadSection: {
    marginTop: 10,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    gap: 8,
  },
  uploadButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  uploadedImageContainer: {
    position: "relative",
  },
  uploadedImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  changeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  changeImageText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    gap: 12,
  },
  skipButton: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 8,
  },
  skipButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    flex: 2,
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
