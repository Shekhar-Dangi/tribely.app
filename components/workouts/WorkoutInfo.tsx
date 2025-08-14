import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING } from "@/constants/theme";
import { profile } from "@/constants/styles";

interface WorkoutInfoProps {
  title: string;
  data: string[];
  timestamp: number;
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function WorkoutInfo({
  title,
  data,
  timestamp,
}: WorkoutInfoProps) {
  return (
    <View
      style={[
        profile.dataCard,
        { flexDirection: "row", alignItems: "flex-start" },
      ]}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: COLORS.background,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        <Ionicons
          name="accessibility-outline"
          size={20}
          color={COLORS.primary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: FONTS.sizes.md,
            fontWeight: "600",
            marginBottom: SPACING.sm,
          }}
        >
          {title}
        </Text>
        {data.map((exercise, idx) => {
          return (
            <Text key={idx} style={profile.dataCardSubtitle}>
              {exercise}
            </Text>
          );
        })}

        <Text style={profile.dataCardDate}>
          Logged: {formatDate(timestamp)}
        </Text>
      </View>
    </View>
  );
}
