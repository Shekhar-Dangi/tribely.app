import { View, Text, Image, TouchableOpacity } from "react-native";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  UserWithProfile,
  isIndividualProfile,
  isGymProfile,
  isBrandProfile,
} from "@/types/schema";

interface UserCardProps {
  user: UserWithProfile;
  variant?: "compact" | "full";
  onPress?: () => void;
}

export default function UserCard({
  user,
  variant = "compact",
  onPress,
}: UserCardProps) {
  const getUserTypeIcon = () => {
    switch (user.userType) {
      case "individual":
        return "person-outline";
      case "gym":
        return "fitness-outline";
      case "brand":
        return "business-outline";
      default:
        return "person-outline";
    }
  };

  const getUserTypeLabel = () => {
    switch (user.userType) {
      case "individual":
        return "Individual";
      case "gym":
        return "Gym";
      case "brand":
        return "Brand";
      default:
        return "User";
    }
  };

  const getSubtitle = () => {
    if (!user.profile) return null;

    if (user.userType === "individual" && isIndividualProfile(user.profile)) {
      if (user.profile.affiliation) {
        return user.profile.affiliation;
      }
      if (user.profile.isTrainingEnabled) {
        return "Personal Trainer";
      }
      return null;
    } else if (user.userType === "gym" && isGymProfile(user.profile)) {
      return user.profile.businessInfo.address || "Gym";
    } else if (user.userType === "brand" && isBrandProfile(user.profile)) {
      return user.profile.businessInfo.industry || "Brand";
    }
    return null;
  };

  const renderCompactCard = () => (
    <TouchableOpacity style={styles.compactCard} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <Image
          source={
            user.avatarUrl
              ? { uri: user.avatarUrl }
              : require("@/assets/images/logo.png")
          }
          style={styles.avatar}
        />
        {user.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={COLORS.primary}
            />
          </View>
        )}
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.username}>@{user.username}</Text>
        <View style={styles.typeContainer}>
          <Ionicons
            name={getUserTypeIcon() as any}
            size={12}
            color={COLORS.textMuted}
          />
          <Text style={styles.userType}>{getUserTypeLabel()}</Text>
          {user.isPremium && (
            <Ionicons
              name="diamond-outline"
              size={12}
              color={COLORS.secondary}
            />
          )}
        </View>
        {getSubtitle() && <Text style={styles.subtitle}>{getSubtitle()}</Text>}
      </View>
    </TouchableOpacity>
  );

  const renderFullCard = () => (
    <TouchableOpacity style={styles.fullCard} onPress={onPress}>
      <View style={styles.fullHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              user.avatarUrl
                ? { uri: user.avatarUrl }
                : require("@/assets/images/logo.png")
            }
            style={styles.largeAvatar}
          />
          {user.isVerified && (
            <View style={styles.verifiedBadgeLarge}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={COLORS.primary}
              />
            </View>
          )}
        </View>

        <View style={styles.fullUserInfo}>
          <Text style={styles.fullUsername}>@{user.username}</Text>
          <View style={styles.typeContainer}>
            <Ionicons
              name={getUserTypeIcon() as any}
              size={14}
              color={COLORS.textMuted}
            />
            <Text style={styles.fullUserType}>{getUserTypeLabel()}</Text>
            {user.isPremium && (
              <Ionicons
                name="diamond-outline"
                size={14}
                color={COLORS.secondary}
              />
            )}
          </View>
          {getSubtitle() && (
            <Text style={styles.fullSubtitle}>{getSubtitle()}</Text>
          )}
          {user.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {user.bio}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user.followerCount}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user.followingCount}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        {user.userType === "individual" &&
          user.profile &&
          isIndividualProfile(user.profile) && (
            <View style={styles.stat}>
              <Text style={styles.statValue}>{user.profile.activityScore}</Text>
              <Text style={styles.statLabel}>Activity</Text>
            </View>
          )}
      </View>
    </TouchableOpacity>
  );

  return variant === "compact" ? renderCompactCard() : renderFullCard();
}

const styles = {
  compactCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  fullCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  fullHeader: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    position: "relative" as const,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  largeAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  verifiedBadge: {
    position: "absolute" as const,
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 2,
  },
  verifiedBadgeLarge: {
    position: "absolute" as const,
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 2,
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  fullUserInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  username: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    ...FONTS.medium,
    marginBottom: 2,
  },
  fullUsername: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    ...FONTS.bold,
    marginBottom: 4,
  },
  typeContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    marginBottom: 2,
  },
  userType: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    ...FONTS.regular,
  },
  fullUserType: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    ...FONTS.regular,
  },
  subtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    ...FONTS.regular,
  },
  fullSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    ...FONTS.regular,
    marginBottom: 4,
  },
  bio: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    ...FONTS.regular,
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  stat: {
    alignItems: "center" as const,
  },
  statValue: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    ...FONTS.bold,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    ...FONTS.regular,
    marginTop: 2,
  },
};
