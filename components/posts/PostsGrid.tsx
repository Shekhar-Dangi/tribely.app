import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import PostCard from "./PostCard";
import PostModal from "./PostModal";
import { COLORS, FONTS, SPACING } from "@/constants/theme";
import { useState } from "react";
import { Post } from "@/types/schema";

interface PostsGridProps {
  userId: Id<"users">;
  variant?: "grid" | "full";
  onPostPress?: (postId: string) => void;
}

export default function PostsGrid({
  userId,
  variant = "grid",
  onPostPress,
}: PostsGridProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch user's posts
  const posts = useQuery(api.posts.getUserPosts, {
    userId,
    privacy: "public", // Only show public posts on profile
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    // The query will automatically refetch
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handlePostPress = (postId: string) => {
    if (onPostPress) {
      onPostPress(postId);
    } else {
      // Find the post and show modal
      const post = posts?.find((p) => p._id === postId);
      if (post) {
        setSelectedPost(post);
        setModalVisible(true);
      }
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPost(null);
  };

  const renderPost = ({ item }: { item: any }) => (
    <PostCard
      post={item}
      variant={variant}
      onPress={() => handlePostPress(item._id)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No posts yet</Text>
      <Text style={styles.emptySubtitle}>
        {variant === "grid"
          ? "Posts will appear here when they're shared"
          : "Share your first post to get started"}
      </Text>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color={COLORS.secondary} />
      <Text style={styles.loadingText}>Loading posts...</Text>
    </View>
  );

  if (posts === undefined) {
    return renderLoading();
  }

  if (variant === "grid") {
    return (
      <View style={styles.container}>
        <FlatList
          key={variant} // Add key to force re-render when variant changes
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.secondary]}
              tintColor={COLORS.secondary}
            />
          }
          ListEmptyComponent={renderEmpty}
        />
        <PostModal
          visible={modalVisible}
          onClose={closeModal}
          post={selectedPost}
        />
      </View>
    );
  }

  // Full variant for feed-like display
  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.fullContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.secondary]}
            tintColor={COLORS.secondary}
          />
        }
        ListEmptyComponent={renderEmpty}
      />
      <PostModal
        visible={modalVisible}
        onClose={closeModal}
        post={selectedPost}
      />
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gridContent: {
    padding: SPACING.xs,
    paddingTop: SPACING.sm,
  },
  fullContent: {
    padding: SPACING.sm,
    paddingTop: 0,
  },
  row: {
    justifyContent: "flex-start" as const,
    paddingHorizontal: 0,
    gap: SPACING.xs,
  },
  emptyState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    ...FONTS.bold,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    ...FONTS.regular,
    textAlign: "center" as const,
    lineHeight: 20,
  },
  loadingState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    ...FONTS.medium,
    marginTop: SPACING.sm,
  },
};
