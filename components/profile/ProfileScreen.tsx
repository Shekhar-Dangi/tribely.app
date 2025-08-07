import React, { useState } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { COLORS } from "@/constants/theme";
import { UserProfileHeader } from "@/components/users";
import { PostsGrid } from "@/components/posts";
import { UserWithProfile } from "@/types/schema";

interface ProfileScreenProps {
  userId?: Id<"users">;
  username?: string;
}

export default function ProfileScreen({
  userId,
  username,
}: ProfileScreenProps) {
  const { user: clerkUser } = useUser();
  const [refreshing, setRefreshing] = useState(false);

  // Get current user to check if viewing own profile
  const currentUser = useQuery(api.users.getUserByClerkId, {
    clerkId: clerkUser?.id || "",
  }) as UserWithProfile | undefined;

  // Get profile user by ID
  const profileUserById = useQuery(
    api.users.getUserWithProfile,
    userId ? { userId } : "skip"
  ) as UserWithProfile | undefined;

  // Get profile user by username
  const profileUserByUsername = useQuery(
    api.users.getUserByUsername,
    username && !userId ? { username } : "skip"
  ) as UserWithProfile | undefined;

  const profileUser = profileUserById || profileUserByUsername;

  // Check if viewing own profile
  const isCurrentUser = currentUser?._id === profileUser?._id;

  // TODO: Check if following (would need to implement follow system)
  const isFollowing = false;
  const isPending = false;

  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh logic here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleFollowPress = async () => {
    if (!profileUser || !currentUser) return;

    // TODO: Implement follow/unfollow logic
    console.log(
      `${isFollowing ? "Unfollowing" : "Following"} user:`,
      profileUser.username
    );
  };

  if (!profileUser) {
    return (
      <View style={styles.loadingContainer}>
        {/* Could add a loading skeleton here */}
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
      <UserProfileHeader
        user={profileUser}
        isCurrentUser={isCurrentUser}
        isFollowing={isFollowing}
        isPending={isPending}
        onFollowPress={handleFollowPress}
      />

      <View style={styles.postsContainer}>
        <PostsGrid userId={profileUser._id as Id<"users">} />
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
    backgroundColor: COLORS.background,
  },
  postsContainer: {
    flex: 1,
    paddingTop: 0,
  },
};
