import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useCallback } from "react";
import { editProfile, onboard, profile, union } from "@/constants/styles";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { COLORS, FONTS, SPACING } from "@/constants/theme";
import WorkoutInfo from "./WorkoutInfo";
import { Ionicons } from "@expo/vector-icons";

import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from "expo-audio";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Id } from "@/convex/_generated/dataModel";

interface ResistanceDetails {
  exercise: string;
  sets: number;
  reps: number[];
  weight: number[];
}

interface CardioDetails {
  type: string;
  distance?: number;
  duration?: number;
}

interface MobilityDetails {
  type: string;
  duration: number;
}

export interface WorkoutLog {
  typedText?: string;
  resistanceDetails?: ResistanceDetails[];
  cardioDetails?: CardioDetails[];
  mobilityDetails?: MobilityDetails[];
}

export default function WorkoutText() {
  const {
    control,
    watch,
    formState: { errors, isDirty },
  } = useForm<WorkoutLog>();

  const [inputError, setInputError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const currentUser = useCurrentUser();
  const logTextWorkout = useMutation(api.workouts.logTextWorkout);
  const { results, loadMore, isLoading } = usePaginatedQuery(
    api.workouts.getRecentLogs,
    {
      userId: currentUser?._id as Id<"users">,
    },
    { initialNumItems: 5 }
  );

  const record = async () => {
    // ...existing code...
  };

  const mapResistance = useCallback(
    (details: ResistanceDetails[] | undefined) => {
      if (!details || details.length === 0) return [];
      return details.map((detail) => {
        let out = detail.exercise + ": ";
        for (let index = 0; index < detail.sets; index++) {
          out += `${detail.weight[index]} kg x ${detail.reps[index]}`;
          if (index < detail.sets - 1) out += ", ";
        }
        return out;
      });
    },
    []
  );

  const mapCardio = useCallback((details: CardioDetails[] | undefined) => {
    if (!details || details.length === 0) return [];
    return details.map((detail) => {
      let out = detail.type + ": ";
      if (detail.distance && detail.duration) {
        out += `${detail.distance} km in ${detail.duration} mins`;
      } else if (detail.distance) {
        out += `${detail.distance} km`;
      } else if (detail.duration) {
        out += `${detail.duration} mins`;
      }
      return out;
    });
  }, []);

  const mapMobility = useCallback((details: MobilityDetails[] | undefined) => {
    if (!details || details.length === 0) return [];
    return details.map((detail) => {
      return `${detail.type}: ${detail.duration} mins`;
    });
  }, []);

  function validateWorkoutLine(line: string): boolean {
    const resistancePattern =
      /^r\/([^/]+)(\/\d+\s*kg\s*x\s*\d+(\s*r\s*\d+)*)+$/i;
    const cardioPattern = /^c\/([^/]+)(\/\d+(\.\d+)?\s*km)?\/\d+\s*min$/i;
    const mobilityPattern = /^m\/([^/]+)\/\d+\s*min$/i;

    const trimmedLine = line.trim();
    if (!trimmedLine) return false;

    return (
      resistancePattern.test(trimmedLine) ||
      cardioPattern.test(trimmedLine) ||
      mobilityPattern.test(trimmedLine)
    );
  }

  function parseWorkoutLogs(input: string): WorkoutLog {
    const lines = input
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean); // Remove empty lines
    
    if (lines.length === 0) {
      throw new Error("No valid workout lines found");
    }
    
    const workoutLog: WorkoutLog = {
      typedText: input,
      resistanceDetails: [],
      cardioDetails: [],
      mobilityDetails: [],
    };

    for (const line of lines) {
      if (!validateWorkoutLine(line)) {
        throw new Error(`Invalid workout line: "${line}"`);
      }
      
      if (line.startsWith("r/")) {
        const parts = line.split("/").slice(1);
        const exercise = parts[0].trim();
        const setParts = parts.slice(1);
        const reps: number[] = [];
        const weight: number[] = [];
        let sets = 0;

        setParts.forEach((p) => {
          const repeatMatch = p.match(/(\d+)\s*kg\s*x\s*(\d+)\s*r\s*(\d+)/i);
          const normalMatch = p.match(/(\d+)\s*kg\s*x\s*(\d+)/i);

          if (repeatMatch) {
            const w = Number(repeatMatch[1]);
            const r = Number(repeatMatch[2]);
            const repeatCount = Number(repeatMatch[3]);
            for (let i = 0; i < repeatCount; i++) {
              weight.push(w);
              reps.push(r);
              sets++;
            }
          } else if (normalMatch) {
            const w = Number(normalMatch[1]);
            const r = Number(normalMatch[2]);
            weight.push(w);
            reps.push(r);
            sets++;
          }
        });

        if (sets > 0) {
          workoutLog.resistanceDetails?.push({ exercise, sets, reps, weight });
        }
      } else if (line.startsWith("c/")) {
        const parts = line.split("/").slice(1);
        const type = parts[0].trim();
        let distance: number | undefined;
        let duration: number | undefined;

        const distMatch = parts[1]?.match(/(\d+(\.\d+)?)\s*km/i);
        if (distMatch) distance = Number(distMatch[1]);

        const durMatch =
          parts[2]?.match(/(\d+)\s*min/i) || parts[1]?.match(/(\d+)\s*min/i);
        if (durMatch) duration = Number(durMatch[1]);

        if (type && (distance || duration)) {
          workoutLog.cardioDetails?.push({ type, distance, duration });
        }
      } else if (line.startsWith("m/")) {
        // Example: m/stretch/30 min
        const parts = line.split("/").slice(1);
        const type = parts[0].trim();
        const durMatch = parts[1]?.match(/(\d+)\s*min/i);
        if (!durMatch) throw new Error(`Invalid mobility duration: "${line}"`);
        const duration = Number(durMatch[1]);

        if (type && duration > 0) {
          workoutLog.mobilityDetails?.push({ type, duration });
        }
      }
    }

    // Validate that we have at least one valid exercise
    if (
      (!workoutLog.resistanceDetails || workoutLog.resistanceDetails.length === 0) &&
      (!workoutLog.cardioDetails || workoutLog.cardioDetails.length === 0) &&
      (!workoutLog.mobilityDetails || workoutLog.mobilityDetails.length === 0)
    ) {
      throw new Error("No valid exercises found in workout log");
    }

    return workoutLog;
  }

  function validateWorkoutLog(text: string): boolean {
    if (!text || text.trim() === "") return false;
    
    const lines = text
      .split(/\n|\r/)
      .map((l) => l.trim())
      .filter(Boolean);
    
    if (lines.length === 0) return false;
    
    for (let line of lines) {
      if (!validateWorkoutLine(line)) {
        return false;
      }
    }
    return true;
  }

  const handleLogPress = async () => {
    const text = watch("typedText") || "";
    
    // Clear previous errors
    setInputError(null);
    
    // Check if user is logged in
    if (!currentUser?._id) {
      setInputError("Please log in to log workouts.");
      return;
    }
    
    // Validate input
    if (!validateWorkoutLog(text)) {
      setInputError("Invalid workout format. Please check your input.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const workoutLog = parseWorkoutLogs(text);
      
      await logTextWorkout({
        userId: currentUser._id as Id<"users">,
        resistanceDetails: workoutLog.resistanceDetails,
        cardioDetails: workoutLog.cardioDetails,
        mobilityDetails: workoutLog.mobilityDetails,
        isEdited: "false",
      });
      
      // Clear the form on success
      control._reset();
      
    } catch (error: any) {
      console.error("Error logging workout:", error);
      
      // Provide more specific error messages
      if (error.message?.includes("User not found")) {
        setInputError("User profile not found. Please complete your profile setup.");
      } else if (error.message?.includes("No Valid Data")) {
        setInputError("Please enter valid workout data.");
      } else if (error.message?.includes("Invalid workout line")) {
        setInputError(error.message);
      } else if (error.message?.includes("No valid exercises")) {
        setInputError("Please enter at least one valid exercise.");
      } else {
        setInputError("Failed to log workout. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const stopRecording = async () => {
    // The recording will be available on `audioRecorder.uri`.
    await audioRecorder.stop();
    console.log("stopped");
    let blob = null;
    if (audioRecorder.uri) {
      console.log(audioRecorder.uri);
      let response = await fetch(audioRecorder.uri);
      console.log(response);
    }
  };

  const renderWorkoutData = (workout: any) => {
    const allData: string[] = [];
    
    // Add resistance exercises
    if (workout.resistanceDetails) {
      allData.push(...mapResistance(workout.resistanceDetails));
    }
    
    // Add cardio exercises
    if (workout.cardioDetails) {
      allData.push(...mapCardio(workout.cardioDetails));
    }
    
    // Add mobility exercises
    if (workout.mobilityDetails) {
      allData.push(...mapMobility(workout.mobilityDetails));
    }
    
    return allData;
  };

  const getWorkoutType = (workout: any): string => {
    const types = [];
    if (workout.resistanceDetails?.length > 0) types.push("Resistance");
    if (workout.cardioDetails?.length > 0) types.push("Cardio");
    if (workout.mobilityDetails?.length > 0) types.push("Mobility");
    
    if (types.length === 0) return "Workout";
    if (types.length === 1) return types[0];
    return "Mixed";
  };

  // Don't render if user is not loaded yet
  if (!currentUser) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={profile.dataCardSubtitle}>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <View style={union.textInputContainer}>
            <Text style={profile.dataCardTitle}>{"Today's Workout"}</Text>
            
            <Controller
              control={control}
              name="typedText"
              rules={{}}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    union.textInput,
                    editProfile.bioInput,
                    { height: 150, fontSize: FONTS.sizes.sm },
                  ]}
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    setInputError(null); // Clear error when user types
                  }}
                  placeholder="Example: r/bench press/75 kg x 12, 80 kg x 10\nc/running/5 km/30 min\nm/stretching/15 min"
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={5}
                />
              )}
            />
          </View>
          {inputError && (
            <Text style={[editProfile.errorText, { marginTop: 4 }]}>
              {inputError}
            </Text>
          )}
        </View>
        <View style={{ alignItems: "flex-end", marginTop: 8 }}>
          <TouchableOpacity
            style={{
              minWidth: 80,
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: isSubmitting ? COLORS.textMuted : COLORS.secondary,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={handleLogPress}
            disabled={isSubmitting}
          >
            <Text style={{ color: COLORS.white, fontSize: FONTS.sizes.md }}>
              {isSubmitting ? "Logging..." : "Log"}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={profile.dataCard}>
          <Text style={profile.dataCardTitle}>Recent Logs</Text>

          {isLoading ? (
            <Text style={profile.dataCardSubtitle}>Loading...</Text>
          ) : results && results.length > 0 ? (
            results.map((result) => (
              <WorkoutInfo
                key={result._id}
                title={getWorkoutType(result)}
                data={renderWorkoutData(result)}
                timestamp={result.createdAt}
              />
            ))
          ) : (
            <Text style={profile.dataCardSubtitle}>No workout logs yet</Text>
          )}
        </View>
      </ScrollView>
      <View
        style={{
          position: "absolute",
          right: 0,
          bottom: 32,
          zIndex: 100,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.secondary,
            borderRadius: 32,
            padding: 8,
            elevation: 2,
          }}
          activeOpacity={0.8}
          onPress={recorderState.isRecording ? stopRecording : record}
        >
          <Ionicons name="mic-outline" size={32} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
