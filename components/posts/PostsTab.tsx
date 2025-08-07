import { View, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import PostsGrid from "./PostsGrid";
import { COLORS, SPACING, BORDER_RADIUS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

interface PostsTabProps {
  userId: Id<"users">;
  onPostPress?: (postId: string) => void;
}

export default function PostsTab({ userId, onPostPress }: PostsTabProps) {
  const [viewMode, setViewMode] = useState<"grid" | "full">("grid");

  return (
    <View style={styles.container}>
      {/* View Toggle */}
      <View style={styles.header}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "grid" && styles.activeToggleButton,
            ]}
            onPress={() => setViewMode("grid")}
          >
            <Ionicons
              name="grid-outline"
              size={18}
              color={viewMode === "grid" ? COLORS.white : COLORS.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "full" && styles.activeToggleButton,
            ]}
            onPress={() => setViewMode("full")}
          >
            <Ionicons
              name="list-outline"
              size={18}
              color={viewMode === "full" ? COLORS.white : COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Posts Grid */}
      <PostsGrid userId={userId} variant={viewMode} onPostPress={onPostPress} />
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "flex-end" as const,
    alignItems: "center" as const,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  viewToggle: {
    flexDirection: "row" as const,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.xs,
  },
  activeToggleButton: {
    backgroundColor: COLORS.secondary,
  },
};
