import React from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "@/constants/theme";
import {
  UserWithProfile,
  isIndividualProfile,
  isGymProfile,
  isBrandProfile,
} from "@/types/schema";
import FollowButton from "./FollowButton";

interface UserProfileHeaderProps {
  user: UserWithProfile;
  isCurrentUser?: boolean;
  isFollowing?: boolean;
  isPending?: boolean;
  onFollowPress?: () => Promise<void> | void;
}

export default function UserProfileHeader({
  user,
  isCurrentUser = false,
  isFollowing = false,
  isPending = false,
  onFollowPress,
}: UserProfileHeaderProps) {
  const getSpecialBadges = () => {
    const badges = [];

    if (user.isVerified) {
      badges.push(
        <View key="verified" style={styles.badge}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
          <Text style={styles.badgeText}>Verified</Text>
        </View>
      );
    }

    if (user.isPremium) {
      badges.push(
        <View key="premium" style={[styles.badge, styles.premiumBadge]}>
          <Ionicons name="diamond" size={16} color={COLORS.secondary} />
          <Text style={[styles.badgeText, styles.premiumText]}>Premium</Text>
        </View>
      );
    }

    // Type-specific badges
    if (
      user.userType === "individual" &&
      user.profile &&
      isIndividualProfile(user.profile)
    ) {
      if (user.profile.isTrainingEnabled) {
        badges.push(
          <View key="trainer" style={[styles.badge, styles.trainerBadge]}>
            <Ionicons name="fitness" size={16} color={COLORS.white} />
            <Text style={[styles.badgeText, styles.trainerText]}>Trainer</Text>
          </View>
        );
      }
    } else if (
      user.userType === "gym" &&
      user.profile &&
      isGymProfile(user.profile)
    ) {
      if (user.profile.verification?.isVerified) {
        badges.push(
          <View key="business" style={[styles.badge, styles.businessBadge]}>
            <Ionicons name="business" size={16} color={COLORS.white} />
            <Text style={[styles.badgeText, styles.businessText]}>
              Certified Gym
            </Text>
          </View>
        );
      }
    }

    return badges;
  };

  const getProfileDetails = () => {
    if (!user.profile) return null;

    if (user.userType === "individual" && isIndividualProfile(user.profile)) {
      return (
        <View style={styles.detailsContainer}>
          {user.profile.affiliation && (
            <View style={styles.detailItem}>
              <Ionicons
                name="school-outline"
                size={16}
                color={COLORS.textMuted}
              />
              <Text style={styles.detailText}>{user.profile.affiliation}</Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <Ionicons
              name="trophy-outline"
              size={16}
              color={COLORS.textMuted}
            />
            <Text style={styles.detailText}>
              Activity Score: {user.profile.activityScore}
            </Text>
          </View>
        </View>
      );
    } else if (user.userType === "gym" && isGymProfile(user.profile)) {
      return (
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons
              name="location-outline"
              size={16}
              color={COLORS.textMuted}
            />
            <Text style={styles.detailText}>
              {user.profile.businessInfo.address}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="call-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.detailText}>
              {user.profile.businessInfo.phone}
            </Text>
          </View>
          {user.profile.businessInfo.website && (
            <View style={styles.detailItem}>
              <Ionicons
                name="globe-outline"
                size={16}
                color={COLORS.textMuted}
              />
              <Text style={styles.detailText}>
                {user.profile.businessInfo.website}
              </Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <Ionicons
              name="people-outline"
              size={16}
              color={COLORS.textMuted}
            />
            <Text style={styles.detailText}>
              {user.profile.stats?.memberCount || 0} members
            </Text>
          </View>
        </View>
      );
    } else if (user.userType === "brand" && isBrandProfile(user.profile)) {
      return (
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons
              name="business-outline"
              size={16}
              color={COLORS.textMuted}
            />
            <Text style={styles.detailText}>
              {user.profile.businessInfo.industry}
            </Text>
          </View>
          {user.profile.businessInfo.website && (
            <View style={styles.detailItem}>
              <Ionicons
                name="globe-outline"
                size={16}
                color={COLORS.textMuted}
              />
              <Text style={styles.detailText}>
                {user.profile.businessInfo.website}
              </Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <Ionicons name="link-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.detailText}>
              {user.profile.partnerships?.length || 0} partnerships
            </Text>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
                size={24}
                color={COLORS.primary}
              />
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.username}>@{user.username}</Text>

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
                  <Text style={styles.statValue}>
                    {user.profile.activityScore}
                  </Text>
                  <Text style={styles.statLabel}>Activity</Text>
                </View>
              )}
          </View>

          <FollowButton
            isFollowing={isFollowing}
            isCurrentUser={isCurrentUser}
            isPending={isPending}
            userType={user.userType}
            onPress={onFollowPress || (() => {})}
            size="medium"
          />
        </View>
      </View>

      {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

      {getSpecialBadges().length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.badgesContainer}
          contentContainerStyle={styles.badgesContent}
        >
          {getSpecialBadges()}
        </ScrollView>
      )}

      {getProfileDetails()}
    </View>
  );
}

const styles = {
  container: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    position: "relative" as const,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: SPACING.md,
  },
  verifiedBadge: {
    position: "absolute" as const,
    bottom: 0,
    right: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 2,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.text,
    ...FONTS.bold,
    marginBottom: SPACING.sm,
  },
  statsContainer: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: SPACING.md,
  },
  stat: {
    alignItems: "center" as const,
    flex: 1,
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
  },
  bio: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    ...FONTS.regular,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  badgesContainer: {
    marginBottom: SPACING.md,
  },
  badgesContent: {
    gap: SPACING.sm,
  },
  badge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  premiumBadge: {
    backgroundColor: COLORS.secondary + "20",
  },
  trainerBadge: {
    backgroundColor: COLORS.primary,
  },
  businessBadge: {
    backgroundColor: COLORS.success,
  },
  badgeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    ...FONTS.medium,
  },
  premiumText: {
    color: COLORS.secondary,
  },
  trainerText: {
    color: COLORS.white,
  },
  businessText: {
    color: COLORS.white,
  },
  detailsContainer: {
    gap: SPACING.sm,
  },
  detailItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: SPACING.sm,
  },
  detailText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    ...FONTS.regular,
  },
};
