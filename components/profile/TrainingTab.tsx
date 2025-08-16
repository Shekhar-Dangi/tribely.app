import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING } from "@/constants/theme";
import { profile } from "@/constants/styles";

interface TrainingRequest {
  _id: Id<"trainingRequests">;
  requesterId: Id<"users">;
  trainerId: Id<"users">;
  message?: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: number;
  updatedAt: number;
  requester?: {
    _id: Id<"users">;
    username: string;
    avatarUrl?: string;
    bio?: string;
    isVerified: boolean;
  };
  trainer?: {
    _id: Id<"users">;
    username: string;
    avatarUrl?: string;
    bio?: string;
    isVerified: boolean;
  };
}

interface TrainingTabProps {
  userId: Id<"users">;
}

export default function TrainingTab({ userId }: TrainingTabProps) {
  const [activeSection, setActiveSection] = useState<"sent" | "received">("received");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch sent requests
  const sentRequests = useQuery(api.follows.getSentTrainingRequests, {
    requesterId: userId,
  });

  // Fetch received requests
  const receivedRequests = useQuery(api.follows.getReceivedTrainingRequests, {
    trainerId: userId,
  });

  // Mutations
  const acceptRequest = useMutation(api.follows.acceptTrainingRequest);
  const rejectRequest = useMutation(api.follows.rejectTrainingRequest);
  const cancelRequest = useMutation(api.follows.cancelTrainingRequest);
  const markComplete = useMutation(api.follows.markTrainingComplete);

  const handleAccept = async (requestId: Id<"trainingRequests">) => {
    try {
      await acceptRequest({ requestId });
    } catch (error) {
      console.error("Failed to accept training request:", error);
    }
  };

  const handleReject = async (requestId: Id<"trainingRequests">) => {
    try {
      await rejectRequest({ requestId });
    } catch (error) {
      console.error("Failed to reject training request:", error);
    }
  };

  const handleCancel = async (requestId: Id<"trainingRequests">) => {
    try {
      await cancelRequest({ requestId });
    } catch (error) {
      console.error("Failed to cancel training request:", error);
    }
  };

  const handleMarkComplete = async (requestId: Id<"trainingRequests">) => {
    try {
      await markComplete({ requestId });
    } catch (error) {
      console.error("Failed to mark training as complete:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return COLORS.warning;
      case "accepted":
        return COLORS.success;
      case "rejected":
        return COLORS.error;
      case "completed":
        return COLORS.success;
      default:
        return COLORS.textMuted;
    }
  };

  const renderRequestItem = ({ item }: { item: TrainingRequest }) => {
    const isReceived = activeSection === "received";
    const otherUser = isReceived ? item.requester : item.trainer;

    if (!otherUser) return null;

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <Image
            source={
              otherUser.avatarUrl
                ? { uri: otherUser.avatarUrl }
                : require("@/assets/images/logo.png")
            }
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>@{otherUser.username}</Text>
              {otherUser.isVerified && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={COLORS.primary}
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            {otherUser.bio && (
              <Text style={styles.bio} numberOfLines={2}>
                {otherUser.bio}
              </Text>
            )}
            <Text style={styles.timestamp}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>

        {item.message && (
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{item.message}</Text>
          </View>
        )}

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item.status)}20` },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>

          {isReceived && item.status === "pending" && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAccept(item._id)}
              >
                <Ionicons name="checkmark" size={18} color={COLORS.white} />
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleReject(item._id)}
              >
                <Ionicons name="close" size={18} color={COLORS.text} />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isReceived && item.status === "pending" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancel(item._id)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}

          {/* Mark as Complete button for accepted requests */}
          {item.status === "accepted" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleMarkComplete(item._id)}
            >
              <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
              <Text style={styles.completeButtonText}>Mark Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    const message =
      activeSection === "sent"
        ? "No training requests sent yet"
        : "No training requests received yet";

    return (
      <View style={styles.emptyState}>
        <Ionicons name="fitness-outline" size={48} color={COLORS.textMuted} />
        <Text style={styles.emptyStateText}>{message}</Text>
      </View>
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    // The queries will automatically refetch
    setTimeout(() => setRefreshing(false), 1000);
  };

  const data = activeSection === "sent" ? sentRequests : receivedRequests;
  const isLoading = data === undefined;
  
  // Filter out null trainers/requesters and ensure type compatibility
  const filteredData = data?.filter((item: any) => {
    const otherUser = activeSection === "sent" ? item.trainer : item.requester;
    return otherUser !== null;
  }) as TrainingRequest[] | undefined;

  return (
    <View style={styles.container}>
      {/* Section Selector */}
      <View style={styles.sectionSelector}>
        <TouchableOpacity
          style={[
            styles.sectionButton,
            activeSection === "received" && styles.activeSectionButton,
          ]}
          onPress={() => setActiveSection("received")}
        >
          <Text
            style={[
              styles.sectionButtonText,
              activeSection === "received" && styles.activeSectionButtonText,
            ]}
          >
            Received ({receivedRequests?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sectionButton,
            activeSection === "sent" && styles.activeSectionButton,
          ]}
          onPress={() => setActiveSection("sent")}
        >
          <Text
            style={[
              styles.sectionButtonText,
              activeSection === "sent" && styles.activeSectionButtonText,
            ]}
          >
            Sent ({sentRequests?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Requests List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredData || []}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  sectionSelector: {
    flexDirection: "row" as const,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  sectionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.xs,
    backgroundColor: COLORS.lightGray,
    alignItems: "center" as const,
  },
  activeSectionButton: {
    backgroundColor: COLORS.secondary,
  },
  sectionButtonText: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.medium,
    color: COLORS.text,
  },
  activeSectionButtonText: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginVertical: SPACING.md,

  },
  requestHeader: {
    flexDirection: "row" as const,
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SPACING.sm,
  },
  userInfo: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  username: {
    fontSize: FONTS.sizes.md,
    ...FONTS.bold,
    color: COLORS.text,
  },
  verifiedIcon: {
    marginLeft: SPACING.xs,
  },
  bio: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  timestamp: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  messageContainer: {
    backgroundColor: COLORS.lightGray,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: FONTS.sizes.xs,
    ...FONTS.bold,
  },
  actionButtons: {
    flexDirection: "row" as const,
    gap: SPACING.sm,
  },
  actionButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 18,
    gap: SPACING.xs,
  },
  acceptButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.lightGray,
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
  },
  acceptButtonText: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.medium,
    color: COLORS.white,
  },
  rejectButtonText: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.medium,
    color: COLORS.text,
  },
  completeButtonText: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.medium,
    color: COLORS.white,
  },
  cancelButtonText: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.medium,
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: SPACING.xxl * 2,
  },
  emptyStateText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
};