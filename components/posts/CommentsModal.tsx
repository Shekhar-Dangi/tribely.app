import {
  View,
  Text,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

interface Comment {
  id: string;
  user: {
    username: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  text: string;
  createdAt: number;
  likeCount?: number;
}

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  post: {
    _id: string;
    content?: string;
    mediaUrl?: string;
    mediaType?: "image" | "video";
    likeCount: number;
    commentCount: number;
    createdAt: number;
    user?: {
      username: string;
      avatarUrl?: string;
      isVerified?: boolean;
    };
  };
  comments?: Comment[];
  onSubmitComment?: (comment: string) => void;
}

export default function CommentsModal({
  visible,
  onClose,
  post,
  comments = [],
  onSubmitComment,
}: CommentsModalProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  // Mock comments for now - replace with real data later
  const mockComments: Comment[] = [
    {
      id: "1",
      user: { username: "john_doe", avatarUrl: undefined, isVerified: false },
      text: "Great post! 🔥",
      createdAt: Date.now() - 3600000, // 1 hour ago
      likeCount: 12,
    },
    {
      id: "2",
      user: { username: "jane_smith", avatarUrl: undefined, isVerified: true },
      text: "Love this! Keep it up 💪",
      createdAt: Date.now() - 7200000, // 2 hours ago
      likeCount: 8,
    },
    {
      id: "3",
      user: {
        username: "fitness_guru",
        avatarUrl: undefined,
        isVerified: false,
      },
      text: "Amazing technique! Can you share more details about your workout routine?",
      createdAt: Date.now() - 10800000, // 3 hours ago
      likeCount: 5,
    },
  ];

  const allComments = comments.length > 0 ? comments : mockComments;

  useEffect(() => {
    if (visible) {
      // Focus input after a small delay to allow modal to open
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 300);
    }
  }, [visible]);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffInHours = Math.floor((now - timestamp) / (1000 * 60 * 60));

    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return `${Math.floor(diffInHours / 168)}w`;
  };

  const handleSubmitComment = async () => {
    if (!comment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    if (onSubmitComment) {
      await onSubmitComment(comment.trim());
    } else {
      // Default behavior - just log for now
      console.log("Submit comment:", comment.trim(), "for post:", post._id);
    }

    setComment("");
    setIsSubmitting(false);
  };

  const handleLikeComment = (commentId: string) => {
    console.log("Like comment:", commentId);
    // TODO: Implement comment like functionality
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Image
        source={
          item.user.avatarUrl
            ? { uri: item.user.avatarUrl }
            : require("@/assets/images/logo.png")
        }
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <View style={styles.commentUserInfo}>
            <Text style={styles.commentUsername}>@{item.user.username}</Text>
            {item.user.isVerified && (
              <Ionicons
                name="checkmark-circle"
                size={12}
                color={COLORS.secondary}
              />
            )}
            <Text style={styles.commentTime}>
              {formatTimeAgo(item.createdAt)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => handleLikeComment(item.id)}
          >
            <Ionicons
              name="heart-outline"
              size={16}
              color={COLORS.textSecondary}
            />
            {item.likeCount && item.likeCount > 0 && (
              <Text style={styles.likeCount}>{item.likeCount}</Text>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIndicator} />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {post.commentCount > 0
                ? `${post.commentCount} comments`
                : "Comments"}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments List */}
        <FlatList
          data={allComments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          style={styles.commentsList}
          contentContainerStyle={styles.commentsContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No comments yet</Text>
              <Text style={styles.emptySubtitle}>Be the first to comment!</Text>
            </View>
          )}
        />

        {/* Comment Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.inputContainer}
        >
          <View style={styles.inputRow}>
            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              placeholder="Add a comment..."
              placeholderTextColor={COLORS.textMuted}
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={500}
              textAlignVertical="center"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                comment.trim().length > 0 &&
                  !isSubmitting &&
                  styles.sendButtonActive,
              ]}
              onPress={handleSubmitComment}
              disabled={comment.trim().length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <Ionicons name="hourglass" size={18} color={COLORS.textMuted} />
              ) : (
                <Ionicons
                  name="send"
                  size={18}
                  color={
                    comment.trim().length > 0 ? COLORS.white : COLORS.textMuted
                  }
                />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerIndicator: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: "center" as const,
    marginBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    ...FONTS.bold,
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    paddingVertical: SPACING.sm,
  },
  commentItem: {
    flexDirection: "row" as const,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 4,
  },
  commentUserInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  commentUsername: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.bold,
    color: COLORS.text,
  },
  commentTime: {
    fontSize: FONTS.sizes.xs,
    ...FONTS.regular,
    color: COLORS.textMuted,
  },
  commentText: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.regular,
    color: COLORS.text,
    lineHeight: 18,
  },
  likeButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 2,
    paddingHorizontal: 4,
  },
  likeCount: {
    fontSize: FONTS.sizes.xs,
    ...FONTS.medium,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    ...FONTS.bold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    ...FONTS.regular,
    color: COLORS.textMuted,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  inputRow: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.md,
    ...FONTS.regular,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  sendButtonActive: {
    backgroundColor: COLORS.secondary,
  },
};
