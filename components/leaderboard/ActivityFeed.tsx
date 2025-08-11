import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING } from "@/constants/theme";

interface ActivityTransaction {
  _id: string;
  activityType: string;
  pointsEarned: number;
  description: string;
  createdAt: number;
  user: {
    username: string;
    avatarUrl?: string;
    userType: "individual" | "gym" | "brand";
    isVerified: boolean;
  } | null;
  metadata?: {
    eventName?: string;
    workoutType?: string;
    achievementName?: string;
    streakDays?: number;
  };
}

interface ActivityFeedProps {
  transactions: ActivityTransaction[];
  onUserPress?: (username: string) => void;
}

const getActivityIcon = (activityType: string) => {
  switch (activityType) {
    case "workout_posted":
      return { name: "fitness", color: COLORS.secondary };
    case "event_created":
      return { name: "calendar", color: COLORS.success };
    case "event_joined":
      return { name: "people", color: COLORS.warning };
    case "follower_gained":
      return { name: "person-add", color: COLORS.secondary };
    case "profile_completed":
      return { name: "checkmark-circle", color: COLORS.success };
    case "weekly_streak":
      return { name: "flame", color: "#FF6B35" };
    case "monthly_milestone":
      return { name: "trophy", color: "#FFD700" };
    case "community_interaction":
      return { name: "chatbubbles", color: COLORS.secondary };
    case "achievement_unlocked":
      return { name: "medal", color: "#FFD700" };
    default:
      return { name: "star", color: COLORS.textMuted };
  }
};

const formatTimeAgo = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  transactions,
  onUserPress,
}) => {
  const renderActivityItem = ({ item }: { item: ActivityTransaction }) => {
    if (!item.user) return null;

    const activityIcon = getActivityIcon(item.activityType);
    const isPositive = item.pointsEarned > 0;

    return (
      <View style={styles.activityItem}>
        {/* Activity Icon */}
        <View
          style={[
            styles.activityIconContainer,
            { backgroundColor: `${activityIcon.color}15` },
          ]}
        >
          <Ionicons
            name={activityIcon.name as any}
            size={20}
            color={activityIcon.color}
          />
        </View>

        {/* Activity Content */}
        <View style={styles.activityContent}>
          <View style={styles.activityHeader}>
            {/* User Avatar */}
            <TouchableOpacity
              style={styles.userAvatarContainer}
              onPress={() => onUserPress?.(item.user!.username)}
            >
              {item.user.avatarUrl ? (
                <Image
                  source={{ uri: item.user.avatarUrl }}
                  style={styles.userAvatar}
                />
              ) : (
                <View style={styles.userAvatarPlaceholder}>
                  <Text style={styles.userAvatarText}>
                    {item.user.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {item.user.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={12}
                    color={COLORS.secondary}
                  />
                </View>
              )}
            </TouchableOpacity>

            {/* Activity Details */}
            <View style={styles.activityDetails}>
              <Text style={styles.activityText}>
                <TouchableOpacity
                  onPress={() => onUserPress?.(item.user!.username)}
                >
                  <Text style={styles.username}>{item.user.username}</Text>
                </TouchableOpacity>
                <Text style={styles.description}> {item.description}</Text>
              </Text>
              <Text style={styles.timeAgo}>
                {formatTimeAgo(item.createdAt)}
              </Text>
            </View>

            {/* Points Earned */}
            <View style={styles.pointsContainer}>
              <Text
                style={[
                  styles.pointsText,
                  { color: isPositive ? COLORS.success : COLORS.error },
                ]}
              >
                {isPositive ? "+" : ""}
                {item.pointsEarned}
              </Text>
            </View>
          </View>

          {/* Metadata */}
          {item.metadata && (
            <View style={styles.metadataContainer}>
              {item.metadata.eventName && (
                <Text style={styles.metadataText}>
                  📅 {item.metadata.eventName}
                </Text>
              )}
              {item.metadata.workoutType && (
                <Text style={styles.metadataText}>
                  💪 {item.metadata.workoutType}
                </Text>
              )}
              {item.metadata.achievementName && (
                <Text style={styles.metadataText}>
                  🏆 {item.metadata.achievementName}
                </Text>
              )}
              {item.metadata.streakDays && (
                <Text style={styles.metadataText}>
                  🔥 {item.metadata.streakDays} day streak!
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="pulse" size={48} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>No recent activity</Text>
        <Text style={styles.emptySubtext}>
          Activity from the community will appear here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // Since this will be inside a ScrollView
      />
    </View>
  );
};

const styles = {
  container: {
    backgroundColor: COLORS.white,
  },
  activityItem: {
    flexDirection: "row" as const,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: SPACING.md,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
  },
  userAvatarContainer: {
    position: "relative" as const,
    marginRight: SPACING.sm,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userAvatarText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: "600" as const,
    color: COLORS.text,
  },
  verifiedBadge: {
    position: "absolute" as const,
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 1,
  },
  activityDetails: {
    flex: 1,
  },
  activityText: {
    fontSize: FONTS.sizes.sm,
    lineHeight: 20,
  },
  username: {
    fontWeight: "600" as const,
    color: COLORS.text,
  },
  description: {
    fontWeight: "400" as const,
    color: COLORS.textSecondary,
  },
  timeAgo: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    fontWeight: "400" as const,
  },
  pointsContainer: {
    alignItems: "flex-end" as const,
  },
  pointsText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: "600" as const,
  },
  metadataContainer: {
    marginTop: SPACING.sm,
    paddingLeft: SPACING.xl,
  },
  metadataText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: "400" as const,
  },
  emptyState: {
    alignItems: "center" as const,
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "600" as const,
    color: COLORS.text,
    marginTop: SPACING.md,
    textAlign: "center" as const,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    textAlign: "center" as const,
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
};
