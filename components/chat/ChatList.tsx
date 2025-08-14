import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING } from "@/constants/theme";
import { profile } from "@/constants/styles";
import { AppHeader } from "@/components/common";

interface ChatListProps {
  onChatPress: (chatId: string, otherUser: any) => void;
}

const formatTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes}m`;
  } else if (hours < 24) {
    return `${hours}h`;
  } else {
    return `${days}d`;
  }
};

export default function ChatList({ onChatPress }: ChatListProps) {
  const router = useRouter();
  const { results, loadMore, isLoading } = usePaginatedQuery(
    api.chats.getUserChats,
    {},
    { initialNumItems: 20 }
  );

  console.log(results);

  const renderHeader = () => (
    <AppHeader
      title="Messages"
      leftIcon="chevron-back"
      onLeftPress={() => router.back()}
    />
  );

  const renderChatItem = ({ item }: { item: any }) => {
    if (!item || !item.otherUser) return null;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => onChatPress(item._id, item.otherUser)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={
              item.otherUser.avatarUrl
                ? { uri: item.otherUser.avatarUrl }
                : require("@/assets/images/logo.png")
            }
            style={styles.avatar}
          />
          {item.otherUser.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={12}
                color={COLORS.white}
              />
            </View>
          )}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.username}>@{item.otherUser.username}</Text>
            <Text style={styles.timestamp}>
              {formatTime(item.lastMessageAt)}
            </Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessagePreview || "No messages yet"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubble-outline" size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyStateTitle}>No conversations yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Start chatting with other users by visiting their profiles
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.secondary} />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {renderHeader()}

      <FlatList
        data={results}
        renderItem={renderChatItem}
        keyExtractor={(item) => item?._id || Math.random().toString()}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={() => loadMore(10)}
        onEndReachedThreshold={0.1}
      />
    </View>
  );
}

const styles = {
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
  },
  chatItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    position: "relative" as const,
    marginRight: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  verifiedBadge: {
    position: "absolute" as const,
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: SPACING.xs,
  },
  username: {
    fontSize: FONTS.sizes.md,
    ...FONTS.medium,
    color: COLORS.text,
  },
  timestamp: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
  },
  lastMessage: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: SPACING.xxl,
  },
  emptyStateTitle: {
    fontSize: FONTS.sizes.lg,
    ...FONTS.medium,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyStateSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: "center" as const,
    lineHeight: 20,
  },
  loadingFooter: {
    paddingVertical: SPACING.md,
    alignItems: "center" as const,
  },
};
