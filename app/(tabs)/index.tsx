import React, { useState } from "react";
import { View, Text, RefreshControl, ScrollView, TouchableOpacity } from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { COLORS, FONTS, SPACING } from "@/constants/theme";
import { Leaderboard } from "@/components/leaderboard";
import { AppHeader } from "@/components/common";
import { UserWithProfile } from "@/types/schema";
import EventCard from "@/components/events/EventCard";
import { useRouter } from "expo-router";

export default function Index() {
  const { user: clerkUser } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Get current user with profile using clerkId
  const currentUser = useQuery(api.users.getUserWithProfileByClerkId, {
    clerkId: clerkUser?.id || "",
  }) as UserWithProfile | undefined;

  // Get leaderboard data (top 10 users)
  const leaderboardData = useQuery(api.leaderboard.getLeaderboard, {
    limit: 10, // Top 10 users
  });

  // Get user's ranking position
  const userRanking = useQuery(api.leaderboard.getUserRanking, {
    userId: currentUser?._id || ("" as any),
  });

  // Get events the user has participated in
  const userEvents = useQuery(api.events.getUserParticipatedEvents, {
    userId: currentUser?._id || ("" as any),
    limit: 10, // Show last 10 events
  });

  const handleUserPress = (user: any) => {
    // Navigate to user profile
    console.log("Navigate to user:", user);
  };

  const handleEventPress = (eventId: string) => {
    // Navigate to event details
    router.push(`/event/${eventId}`);
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

  // Helper function to get ordinal suffix
  const getOrdinalSuffix = (position: number) => {
    const j = position % 10;
    const k = position % 100;
    if (j === 1 && k !== 11) {
      return "st";
    }
    if (j === 2 && k !== 12) {
      return "nd";
    }
    if (j === 3 && k !== 13) {
      return "rd";
    }
    return "th";
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
             
              {userRanking && currentUser.userType === "individual" && (
      <Text style={styles.sectionSubtitle}>
                You&apos;re ranked {userRanking.position}
                {getOrdinalSuffix(userRanking.position)}.
           </Text>
          )}
            </Text>
          </View>
          <Leaderboard
            users={leaderboardData || []}
            onUserPress={handleUserPress}
          />
          
          {/* User's Ranking Position */}
 
        </View>

        {/* User's Participated Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Events</Text>
            <Text style={styles.sectionSubtitle}>
              Events you&apos;ve participated in
            </Text>
          </View>
          
          {userEvents && userEvents.length > 0 ? (
            <View style={styles.eventsContainer}>
              {userEvents.map((event: any) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onPress={() => handleEventPress(event._id)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                You haven&apos;t participated in any events yet
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push("/(tabs)/events")}
              >
                <Text style={styles.exploreButtonText}>Explore Events</Text>
              </TouchableOpacity>
            </View>
          )}
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
  userRankingContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  userRankingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    ...FONTS.medium,
    textAlign: "center" as const,
  },
  eventsContainer: {
    paddingVertical: SPACING.md,
  },
  emptyStateContainer: {
    padding: SPACING.xl,
    alignItems: "center" as const,
  },
  emptyStateText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    ...FONTS.regular,
    textAlign: "center" as const,
    marginBottom: SPACING.lg,
  },
  exploreButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.xs,
  },
  exploreButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    ...FONTS.medium,
  },
};
