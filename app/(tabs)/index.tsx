import React, { useState } from "react";
import { View, Text, RefreshControl, ScrollView } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { COLORS, FONTS, SPACING } from "@/constants/theme";
import { UserCard } from "@/components/users";
import { UserWithProfile } from "@/types/schema";

export default function Index() {
  const { user: clerkUser } = useUser();
  const [refreshing, setRefreshing] = useState(false);

  // Get current user with profile using clerkId
  const currentUser = useQuery(api.users.getUserWithProfileByClerkId, {
    clerkId: clerkUser?.id || "",
  }) as UserWithProfile | undefined;

  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh logic here
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={COLORS.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <UserCard
          user={currentUser}
          variant="compact"
          onPress={() => {
            // Navigate to profile
          }}
        />
      </View>
    </ScrollView>
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
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  welcomeText: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.text,
    ...FONTS.bold,
    marginBottom: SPACING.md,
  },
  content: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    ...FONTS.bold,
    marginBottom: SPACING.md,
  },
};
