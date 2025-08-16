import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
} from "react-native";
import { profile } from "@/constants/styles";
import WorkoutInfo from "./WorkoutInfo";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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

interface WorkoutDisplayProps {
  userId: Id<"users">;
  isOwnProfile: boolean;
  username?: string;
}

export default function WorkoutDisplay({ userId, isOwnProfile, username }: WorkoutDisplayProps) {
  const { results, loadMore, isLoading } = usePaginatedQuery(
    api.workouts.getRecentLogs,
    {
      userId: userId,
    },
    { initialNumItems: 5 }
  );

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

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={profile.dataCardSubtitle}>
              {isOwnProfile ? "No workout logs yet" : `@${username} hasn't logged any workouts yet`}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}