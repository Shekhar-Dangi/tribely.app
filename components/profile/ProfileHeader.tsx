import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "@/constants/theme";

interface ProfileHeaderProps {
  title?: string;
  onNotificationsPress?: () => void;
  onMessagesPress?: () => void;
}

export default function ProfileHeader({
  title = "Profile",
  onNotificationsPress,
  onMessagesPress,
}: ProfileHeaderProps) {
  const handleNotifications = () => {
    console.log("Notifications pressed");
    onNotificationsPress?.();
  };

  const handleMessages = () => {
    console.log("Messages pressed");
    onMessagesPress?.();
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleNotifications}
          activeOpacity={0.6}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <Text style={styles.title}>{title}</Text>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleMessages}
          activeOpacity={0.6}
        >
          <Ionicons name="chatbubble-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 8,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    flex: 1,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: COLORS.background,
  },
});
