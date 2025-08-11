import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "@/constants/theme";

interface EventsHeaderProps {
  onCreateEventPress: () => void;
  onMyEventsPress: () => void;
}

export default function EventsHeader({
  onCreateEventPress,
  onMyEventsPress,
}: EventsHeaderProps) {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={onMyEventsPress}>
          <Ionicons name="list-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        <Text style={styles.title}>Events</Text>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onCreateEventPress}
        >
          <Ionicons name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    ...FONTS.bold,
    color: COLORS.primary,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderRadius: BORDER_RADIUS.sm,
  },
};
