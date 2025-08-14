import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { AppHeader } from "@/components/common";

interface ChatScreenProps {
  chatId: string;
  otherUser: {
    _id: string;
    username: string;
    avatarUrl?: string;
    isVerified: boolean;
  };
  onBack: () => void;
}

const formatMessageTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
};

export default function ChatScreen({
  chatId,
  otherUser,
  onBack,
}: ChatScreenProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const currentUser = useCurrentUser();

  const { results, loadMore, isLoading } = usePaginatedQuery(
    api.chats.getChatMessages,
    { chatId: chatId as Id<"chats"> },
    { initialNumItems: 50 }
  );

  const sendMessage = useMutation(api.chats.sendMessage);
  const markAsRead = useMutation(api.chats.markMessagesAsRead);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (chatId) {
      markAsRead({ chatId: chatId as Id<"chats"> });
    }
  }, [chatId, markAsRead]);

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage({
        chatId: chatId as Id<"chats">,
        content: message.trim(),
      });
      setMessage("");
      // Mark messages as read after sending
      markAsRead({ chatId: chatId as Id<"chats"> });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isOwnMessage = currentUser && item.sender?._id === currentUser._id;

    return (
      <View
        style={[styles.messageContainer, isOwnMessage && styles.ownMessage]}
      >
        <View style={[styles.messageBubble, isOwnMessage && styles.ownBubble]}>
          <Text
            style={[styles.messageText, isOwnMessage && styles.ownMessageText]}
          >
            {item.content}
          </Text>
          <Text
            style={[styles.messageTime, isOwnMessage && styles.ownMessageTime]}
          >
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <AppHeader
      title={`@${otherUser.username}`}
      leftIcon="chevron-back"
      onLeftPress={onBack}
      rightIcon="ellipsis-horizontal"
      onRightPress={() => {}}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubble-outline" size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyStateText}>No messages yet</Text>
      <Text style={styles.emptyStateSubtext}>Start the conversation!</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {results.length == 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            ref={flatListRef}
            data={results}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            inverted
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesList}
            onEndReached={() => loadMore(20)}
            onEndReachedThreshold={0.1}
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !message.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="send" size={20} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  messageContainer: {
    marginVertical: SPACING.xs,
    alignItems: "flex-start" as const,
  },
  ownMessage: {
    alignItems: "flex-end" as const,
  },
  messageBubble: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 18,
    maxWidth: "80%",
  },
  ownBubble: {
    backgroundColor: COLORS.secondary,
  },
  messageText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    lineHeight: 20,
  },
  ownMessageText: {
    color: COLORS.white,
  },
  messageTime: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    alignSelf: "flex-end" as const,
  },
  ownMessageTime: {
    color: `${COLORS.white}80`,
  },
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    fontSize: FONTS.sizes.md,
    maxHeight: 100,
    textAlignVertical: "top" as const,
  },
  sendButton: {
    backgroundColor: COLORS.secondary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: SPACING.xxl,
  },
  emptyStateText: {
    fontSize: FONTS.sizes.lg,
    ...FONTS.medium,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateSubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
};
