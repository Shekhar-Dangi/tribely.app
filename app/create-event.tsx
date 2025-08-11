import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import DateTimePicker from "@react-native-community/datetimepicker";

import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { COLORS } from "@/constants/theme";
import { onboard, union } from "@/constants/styles";
import { Id } from "@/convex/_generated/dataModel";

interface CreateEventForm {
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  location?: string;
  maxParticipants?: string;
  eventType: "workout" | "competition" | "meetup" | "seminar";
  isPublic: boolean;
}

const EVENT_TYPES = [
  {
    value: "workout" as const,
    label: "Workout",
    icon: "fitness-outline",
    description: "Physical training session or exercise class",
  },
  {
    value: "competition" as const,
    label: "Competition",
    icon: "trophy-outline",
    description: "Competitive event with winners and prizes",
  },
  {
    value: "meetup" as const,
    label: "Meetup",
    icon: "people-outline",
    description: "Social gathering for fitness enthusiasts",
  },
  {
    value: "seminar" as const,
    label: "Seminar",
    icon: "school-outline",
    description: "Educational session or workshop",
  },
];

export default function CreateEvent() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const [isCreating, setIsCreating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const createEvent = useMutation(api.events.createEvent);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CreateEventForm>({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: undefined,
      location: "",
      maxParticipants: "",
      eventType: "workout",
      isPublic: true,
    },
  });

  const watchedDate = watch("date");
  const watchedEndDate = watch("endDate");
  const watchedEventType = watch("eventType");

  const handleBackPress = () => {
    router.back();
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    setShowEndDatePicker(false);
    
    if (selectedDate) {
      if (showDatePicker) {
        setValue("date", selectedDate);
        // If end date is before new date, clear it
        if (watchedEndDate && selectedDate > watchedEndDate) {
          setValue("endDate", undefined);
        }
      } else if (showEndDatePicker) {
        setValue("endDate", selectedDate);
      }
    }
  };

  const validateForm = (data: CreateEventForm): string | null => {
    // Title validation
    if (!data.title.trim()) {
      return "Event title is required";
    }
    if (data.title.length < 3) {
      return "Event title must be at least 3 characters long";
    }
    if (data.title.length > 100) {
      return "Event title must be less than 100 characters";
    }

    // Description validation
    if (!data.description.trim()) {
      return "Event description is required";
    }
    if (data.description.length < 10) {
      return "Event description must be at least 10 characters long";
    }
    if (data.description.length > 1000) {
      return "Event description must be less than 1000 characters";
    }

    // Date validation
    const now = new Date();
    if (data.date <= now) {
      return "Event date must be in the future";
    }

    // End date validation
    if (data.endDate && data.endDate <= data.date) {
      return "End date must be after the start date";
    }

    // Location validation (optional but if provided, should be reasonable)
    if (data.location && data.location.trim()) {
      if (data.location.length < 3) {
        return "Location must be at least 3 characters long";
      }
      if (data.location.length > 200) {
        return "Location must be less than 200 characters";
      }
    }

    // Max participants validation
    if (data.maxParticipants && data.maxParticipants.trim()) {
      const num = parseInt(data.maxParticipants);
      if (isNaN(num)) {
        return "Maximum participants must be a valid number";
      }
      if (num < 1) {
        return "Maximum participants must be at least 1";
      }
      if (num > 10000) {
        return "Maximum participants cannot exceed 10,000";
      }
    }

    return null;
  };

  const onSubmit = async (data: CreateEventForm) => {
    if (!currentUser) {
      Alert.alert("Error", "Please log in to create events");
      return;
    }

    // Validate form
    const validationError = validateForm(data);
    if (validationError) {
      Alert.alert("Validation Error", validationError);
      return;
    }

    setIsCreating(true);
    try {
      const eventData = {
        creatorId: currentUser._id as Id<"users">,
        title: data.title.trim(),
        description: data.description.trim(),
        date: data.date.getTime(),
        endDate: data.endDate ? data.endDate.getTime() : undefined,
        location: data.location?.trim() || undefined,
        maxParticipants: data.maxParticipants?.trim() 
          ? parseInt(data.maxParticipants.trim()) 
          : undefined,
        eventType: data.eventType,
        isPublic: data.isPublic,
      };

      await createEvent(eventData);
      
      Alert.alert(
        "Success", 
        "Event created successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          }
        ]
      );
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert(
        "Error", 
        "Failed to create event. Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Event Type Selection */}
        <View style={onboard.wideCard}>
          <Text style={onboard.cardTitle}>Event Type</Text>
          <View style={styles.eventTypeContainer}>
            {EVENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.eventTypeCard,
                  watchedEventType === type.value && styles.eventTypeCardSelected,
                ]}
                onPress={() => setValue("eventType", type.value)}
              >
                <View style={styles.eventTypeContent}>
                  <View
                    style={[
                      styles.eventTypeIcon,
                      watchedEventType === type.value && styles.eventTypeIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={24}
                      color={
                        watchedEventType === type.value
                          ? COLORS.secondary
                          : COLORS.textMuted
                      }
                    />
                  </View>
                  <View style={styles.eventTypeTextContainer}>
                    <Text style={styles.eventTypeTitle}>{type.label}</Text>
                    <Text style={styles.eventTypeDescription}>
                      {type.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Basic Information */}
        <View style={onboard.wideCard}>
          <Text style={onboard.cardTitle}>Event Information</Text>

          {/* Title */}
          <Controller
            control={control}
            name="title"
            rules={{
              required: "Event title is required",
              minLength: {
                value: 3,
                message: "Title must be at least 3 characters",
              },
              maxLength: {
                value: 100,
                message: "Title must be less than 100 characters",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={union.textInputContainer}>
                <Text style={union.textInputLabel}>Event Title *</Text>
                <TextInput
                  style={[
                    union.textInput,
                    errors.title && { borderColor: COLORS.error },
                  ]}
                  placeholder="Enter event title"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  maxLength={100}
                />
                {errors.title && (
                  <Text style={styles.errorText}>{errors.title.message}</Text>
                )}
              </View>
            )}
          />

          {/* Description */}
          <Controller
            control={control}
            name="description"
            rules={{
              required: "Event description is required",
              minLength: {
                value: 10,
                message: "Description must be at least 10 characters",
              },
              maxLength: {
                value: 1000,
                message: "Description must be less than 1000 characters",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={union.textInputContainer}>
                <Text style={union.textInputLabel}>Description *</Text>
                <TextInput
                  style={[
                    union.textInput,
                    styles.descriptionInput,
                    errors.description && { borderColor: COLORS.error },
                  ]}
                  placeholder="Describe your event in detail"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  multiline
                  textAlignVertical="top"
                  maxLength={1000}
                />
                <Text style={styles.characterCount}>
                  {value.length}/1000 characters
                </Text>
                {errors.description && (
                  <Text style={styles.errorText}>{errors.description.message}</Text>
                )}
              </View>
            )}
          />

          {/* Location */}
          <Controller
            control={control}
            name="location"
            rules={{
              minLength: {
                value: 3,
                message: "Location must be at least 3 characters",
              },
              maxLength: {
                value: 200,
                message: "Location must be less than 200 characters",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={union.textInputContainer}>
                <Text style={union.textInputLabel}>Location</Text>
                <TextInput
                  style={[
                    union.textInput,
                    errors.location && { borderColor: COLORS.error },
                  ]}
                  placeholder="Where will this event take place?"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  maxLength={200}
                />
                {errors.location && (
                  <Text style={styles.errorText}>{errors.location.message}</Text>
                )}
              </View>
            )}
          />

          {/* Max Participants */}
          <Controller
            control={control}
            name="maxParticipants"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={union.textInputContainer}>
                <Text style={union.textInputLabel}>Maximum Participants</Text>
                <TextInput
                  style={[
                    union.textInput,
                    errors.maxParticipants && { borderColor: COLORS.error },
                  ]}
                  placeholder="Leave empty for unlimited"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="numeric"
                />
                {errors.maxParticipants && (
                  <Text style={styles.errorText}>
                    {errors.maxParticipants.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>

        {/* Date and Time */}
        <View style={onboard.wideCard}>
          <Text style={onboard.cardTitle}>Schedule</Text>

          {/* Start Date */}
          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Start Date & Time *</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.dateTimeText}>
                {formatDateTime(watchedDate)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* End Date */}
          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>End Date & Time</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.dateTimeText}>
                {watchedEndDate ? formatDateTime(watchedEndDate) : "Optional"}
              </Text>
            </TouchableOpacity>
            {watchedEndDate && (
              <TouchableOpacity
                style={styles.clearEndDateButton}
                onPress={() => setValue("endDate", undefined)}
              >
                <Text style={styles.clearEndDateText}>Clear end date</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={onboard.wideCard}>
          <Text style={onboard.cardTitle}>Privacy & Visibility</Text>
          
          <Controller
            control={control}
            name="isPublic"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchContainer}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchLabel}>Public Event</Text>
                  <Text style={styles.switchDescription}>
                    {value 
                      ? "Anyone can discover and join this event"
                      : "Only people you share the link with can join"}
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.secondary }}
                  thumbColor={COLORS.white}
                />
              </View>
            )}
          />
        </View>

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              union.button,
              (!isValid || isCreating) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || isCreating}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
                <Text style={[union.buttonText, { marginLeft: 8 }]}>
                  Create Event
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {(showDatePicker || showEndDatePicker) && (
        <DateTimePicker
          value={showDatePicker ? watchedDate : (watchedEndDate || new Date())}
          mode="datetime"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          minimumDate={showDatePicker ? new Date() : watchedDate}
        />
      )}
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: COLORS.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  eventTypeContainer: {
    gap: 12,
  },
  eventTypeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  eventTypeCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: `${COLORS.secondary}05`,
  },
  eventTypeContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  eventTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 16,
  },
  eventTypeIconSelected: {
    backgroundColor: `${COLORS.secondary}15`,
  },
  eventTypeTextContainer: {
    flex: 1,
  },
  eventTypeTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  eventTypeDescription: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: "top" as const,
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "right" as const,
    marginTop: 4,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  dateTimeButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    gap: 12,
  },
  dateTimeText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "400" as const,
  },
  clearEndDateButton: {
    alignSelf: "flex-start" as const,
    marginTop: 8,
  },
  clearEndDateText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: "500" as const,
  },
  switchContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  buttonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
};
