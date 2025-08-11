import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING } from "@/constants/theme";

interface LeaderboardUser {
  _id: string;
  username: string;
  avatarUrl?: string;
  userType: "individual" | "gym" | "brand";
  isVerified: boolean;
  activityScore: number;
  profile?: any;
}

interface LeaderboardProps {
  users: LeaderboardUser[];
  onUserPress?: (user: LeaderboardUser) => void;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return { name: "trophy", color: "#FFD700" }; // Gold
    case 2:
      return { name: "medal", color: "#C0C0C0" }; // Silver
    case 3:
      return { name: "medal", color: "#CD7F32" }; // Bronze
    default:
      return null;
  }
};

const getUserTypeColor = (userType: string) => {
  switch (userType) {
    case "individual":
      return COLORS.secondary;
    case "gym":
      return COLORS.success;
    case "brand":
      return COLORS.warning;
    default:
      return COLORS.textMuted;
  }
};

export const Leaderboard: React.FC<LeaderboardProps> = ({
  users,
  onUserPress,
}) => {
  const renderLeaderboardItem = ({
    item,
    index,
  }: {
    item: LeaderboardUser;
    index: number;
  }) => {
    const rank = index + 1;
    const rankIcon = getRankIcon(rank);
    const userTypeColor = getUserTypeColor(item.userType);

    return (
      <TouchableOpacity
        style={[styles.leaderboardItem, rank <= 3 && styles.topThreeItem]}
        onPress={() => onUserPress?.(item)}
      >
        {/* Rank */}
        <View style={styles.rankContainer}>
          {rankIcon ? (
            <Ionicons
              name={rankIcon.name as any}
              size={24}
              color={rankIcon.color}
            />
          ) : (
            <Text style={styles.rankText}>{rank}</Text>
          )}
        </View>

        {/* User Avatar */}
        <View style={styles.avatarContainer}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {item.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={COLORS.secondary}
              />
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.username}>{item.username}</Text>
            <View
              style={[styles.userTypeBadge, { backgroundColor: userTypeColor }]}
            >
              <Text style={styles.userTypeText}>
                {item.userType.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.userType}>
            {item.userType.charAt(0).toUpperCase() + item.userType.slice(1)}
          </Text>
        </View>

        {/* Activity Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreNumber}>
            {item.activityScore.toLocaleString()}
          </Text>
          <Text style={styles.scoreLabel}>points</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (users.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="trophy-outline" size={48} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>No leaderboard data yet</Text>
        <Text style={styles.emptySubtext}>
          Start working out and earning points to appear here!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderLeaderboardItem}
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
  leaderboardItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  topThreeItem: {
    backgroundColor: `${COLORS.secondary}03`,
  },
  rankContainer: {
    width: 40,
    alignItems: "center" as const,
    marginRight: SPACING.md,
  },
  rankText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "700" as const,
    color: COLORS.text,
  },
  avatarContainer: {
    position: "relative" as const,
    marginRight: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  avatarText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "700" as const,
    color: COLORS.text,
  },
  verifiedBadge: {
    position: "absolute" as const,
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 1,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: SPACING.xs,
  },
  username: {
    fontSize: FONTS.sizes.md,
    fontWeight: "600" as const,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  userTypeBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  userTypeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: COLORS.white,
  },
  userType: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: "400" as const,
  },
  scoreContainer: {
    alignItems: "flex-end" as const,
  },
  scoreNumber: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "700" as const,
    color: COLORS.secondary,
  },
  scoreLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
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
