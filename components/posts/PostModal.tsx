import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { useState } from "react";
import { COLORS, FONTS, SPACING } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import CommentsModal from "./CommentsModal";
import { Post } from "@/types/schema";

const { width, height } = Dimensions.get("window");

interface PostModalProps {
  visible: boolean;
  onClose: () => void;
  post: Post | null;
}

export default function PostModal({ visible, onClose, post }: PostModalProps) {
  const [liked, setLiked] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);

  if (!post) return null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleLike = () => {
    setLiked(!liked);
    // TODO: Implement like functionality
    console.log("Like post:", post._id);
  };

  const handleCommentPress = () => {
    setCommentsVisible(true);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log("Share post:", post._id);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerUser}>
            <Image
              source={
                post.user?.avatarUrl
                  ? { uri: post.user.avatarUrl }
                  : require("@/assets/images/logo.png")
              }
              style={styles.headerAvatar}
            />
            <Text style={styles.headerUsername}>
              @{post.user?.username || "user"}
            </Text>
            {post.user?.isVerified && (
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={COLORS.secondary}
              />
            )}
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Media */}
          {post.mediaUrl && (
            <View style={styles.mediaContainer}>
              <Image
                source={{ uri: post.mediaUrl }}
                style={styles.media}
                resizeMode="contain"
              />
              {post.mediaType === "video" && (
                <TouchableOpacity style={styles.playButton}>
                  <Ionicons name="play" size={30} color={COLORS.white} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Caption and Comments */}
          <View style={styles.bottomSection}>
            {/* Action Buttons */}
            <View style={styles.actions}>
              <View style={styles.leftActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleLike}
                >
                  <Ionicons
                    name={liked ? "heart" : "heart-outline"}
                    size={24}
                    color={liked ? COLORS.error : COLORS.white}
                  />
                  <Text style={styles.actionText}>
                    {post.likeCount + (liked ? 1 : 0)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleCommentPress}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={22}
                    color={COLORS.white}
                  />
                  <Text style={styles.actionText}>{post.commentCount}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleShare}
                >
                  <Ionicons
                    name="paper-plane-outline"
                    size={22}
                    color={COLORS.white}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.dateText}>{formatDate(post.createdAt)}</Text>
            </View>

            {/* Caption */}
            {post.content && (
              <View style={styles.captionSection}>
                <Text style={styles.caption}>{post.content}</Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>

        {/* Comments Modal */}
        {post && (
          <CommentsModal
            visible={commentsVisible}
            onClose={() => setCommentsVisible(false)}
            post={post}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: SPACING.md,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerUser: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: SPACING.xs,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerUsername: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    ...FONTS.medium,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    position: "relative" as const,
  },
  media: {
    width: width,
    height: height * 0.5,
    maxHeight: 500,
  },
  playButton: {
    position: "absolute" as const,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  bottomSection: {
    backgroundColor: "rgba(0,0,0,0.9)",
    maxHeight: height * 0.5,
  },
  actions: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  leftActions: {
    flexDirection: "row" as const,
    gap: SPACING.lg,
  },
  actionButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  actionText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    ...FONTS.medium,
  },
  dateText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    ...FONTS.regular,
  },
  captionSection: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  caption: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    ...FONTS.regular,
    lineHeight: 20,
  },
};
