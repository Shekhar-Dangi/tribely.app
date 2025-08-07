import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const POST_IMAGE_SIZE = (width - SPACING.xl * 2 - SPACING.sm * 2) / 3;

interface PostCardProps {
  post: {
    _id: string;
    content?: string;
    mediaUrl?: string;
    mediaType?: "image" | "video";
    likeCount: number;
    commentCount: number;
    createdAt: number;
  };
  variant?: "grid" | "full";
  onPress?: () => void;
}

export default function PostCard({
  post,
  variant = "full",
  onPress,
}: PostCardProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return `${Math.floor(diffInHours / 168)}w`;
  };

  // Grid variant for profile posts (Instagram-like)
  if (variant === "grid") {
    return (
      <TouchableOpacity style={styles.gridItem} onPress={onPress}>
        {post.mediaUrl ? (
          <View style={styles.gridImageContainer}>
            <Image
              source={{ uri: post.mediaUrl }}
              style={styles.gridImage}
              resizeMode="cover"
            />
            {post.mediaType === "video" && (
              <View style={styles.videoIcon}>
                <Ionicons name="play" size={12} color={COLORS.white} />
              </View>
            )}
            {(post.likeCount > 0 || post.commentCount > 0) && (
              <View style={styles.gridStats}>
                {post.likeCount > 0 && (
                  <View style={styles.gridStat}>
                    <Ionicons name="heart" size={12} color={COLORS.white} />
                    <Text style={styles.gridStatText}>{post.likeCount}</Text>
                  </View>
                )}
                {post.commentCount > 0 && (
                  <View style={styles.gridStat}>
                    <Ionicons
                      name="chatbubble"
                      size={12}
                      color={COLORS.white}
                    />
                    <Text style={styles.gridStatText}>{post.commentCount}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.gridTextPost}>
            <Text style={styles.gridTextContent} numberOfLines={4}>
              {post.content}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Full variant for feed (LinkedIn-like)
  return (
    <TouchableOpacity style={styles.fullCard} onPress={onPress}>
      {/* Content */}
      {post.content && (
        <View style={styles.contentSection}>
          <Text style={styles.contentText}>{post.content}</Text>
        </View>
      )}

      {/* Media */}
      {post.mediaUrl && (
        <View style={styles.mediaSection}>
          <Image
            source={{ uri: post.mediaUrl }}
            style={styles.fullImage}
            resizeMode="cover"
          />
          {post.mediaType === "video" && (
            <View style={styles.fullVideoIcon}>
              <Ionicons name="play-circle" size={40} color={COLORS.white} />
            </View>
          )}
        </View>
      )}

      {/* Stats and timestamp */}
      <View style={styles.statsSection}>
        <View style={styles.statsRow}>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Ionicons
                name="heart-outline"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.statText}>{post.likeCount}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons
                name="chatbubble-outline"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.statText}>{post.commentCount}</Text>
            </View>
          </View>
          <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = {
  // Grid variant styles
  gridItem: {
    width: POST_IMAGE_SIZE,
    height: POST_IMAGE_SIZE,
    marginBottom: SPACING.xs,
  },
  gridImageContainer: {
    flex: 1,
    position: "relative" as const,
    borderRadius: BORDER_RADIUS.xs,
    overflow: "hidden" as const,
  },
  gridImage: {
    width: "100%" as const,
    height: "100%" as const,
  },
  videoIcon: {
    position: "absolute" as const,
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
    padding: 2,
  },
  gridStats: {
    position: "absolute" as const,
    bottom: SPACING.xs,
    right: SPACING.xs,
    flexDirection: "row" as const,
    gap: SPACING.xs,
  },
  gridStat: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  gridStatText: {
    color: COLORS.white,
    fontSize: 10,
    ...FONTS.medium,
  },
  gridTextPost: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xs,
    padding: SPACING.sm,
    justifyContent: "center" as const,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gridTextContent: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    ...FONTS.regular,
    textAlign: "center" as const,
  },

  // Full variant styles
  fullCard: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
    overflow: "hidden" as const,
  },
  contentSection: {
    padding: SPACING.md,
  },
  contentText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    ...FONTS.regular,
    lineHeight: 20,
  },
  mediaSection: {
    position: "relative" as const,
  },
  fullImage: {
    width: "100%" as const,
    height: 300,
  },
  fullVideoIcon: {
    position: "absolute" as const,
    top: "50%" as const,
    left: "50%" as const,
    marginLeft: -20,
    marginTop: -20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
  },
  statsSection: {
    padding: SPACING.md,
  },
  statsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  stats: {
    flexDirection: "row" as const,
    gap: SPACING.lg,
  },
  stat: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  statText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  timestamp: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    ...FONTS.regular,
  },
};
