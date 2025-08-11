import React, { useState } from "react";
import { View, Text, RefreshControl, ScrollView } from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { COLORS, FONTS, SPACING } from "@/constants/theme";
import { Leaderboard, ActivityFeed } from "@/components/leaderboard";
import { AppHeader } from "@/components/common";
import { UserWithProfile } from "@/types/schema";

export default function Index() {
  const { user: clerkUser } = useUser();
  const { signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Get current user with profile using clerkId
  const currentUser = useQuery(api.users.getUserWithProfileByClerkId, {
    clerkId: clerkUser?.id || "",
  }) as UserWithProfile | undefined;

  // Get leaderboard data
  const leaderboardData = useQuery(api.leaderboard.getLeaderboard, {
    limit: 10, // Top 10 users
  });

  // Get recent activity feed
  const activityFeed = useQuery(api.leaderboard.getRecentActivityFeed, {
    limit: 20, // Last 20 activities
  });

  const handleUserPress = (user: any) => {
    // Navigate to user profile
    console.log("Navigate to user:", user);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh logic here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleNotifications = () => {
    console.log("Notifications pressed");
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Home"
        leftIcon="notifications-outline"
        onLeftPress={handleNotifications}
        rightIcon="log-out-outline"
        onRightPress={handleLogout}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Leaderboard Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activity Leaderboard</Text>
            <Text style={styles.sectionSubtitle}>
              Top members by activity score
            </Text>
          </View>
          <Leaderboard
            users={leaderboardData || []}
            onUserPress={handleUserPress}
          />
        </View>

        {/* Activity Feed Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Text style={styles.sectionSubtitle}>
              Latest community activities
            </Text>
          </View>
          <ActivityFeed
            transactions={activityFeed || []}
            onUserPress={handleUserPress}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    ...FONTS.regular,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    ...FONTS.bold,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    ...FONTS.regular,
  },
};
