import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Id } from "@/convex/_generated/dataModel";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "@/constants/theme";

const getEventTypeIcon = (type: string) => {
  switch (type) {
    case "workout":
      return "fitness-outline";
    case "competition":
      return "trophy-outline";
    case "meetup":
      return "people-outline";
    case "seminar":
      return "school-outline";
    default:
      return "calendar-outline";
  }
};

const getEventTypeColor = (type: string) => {
  switch (type) {
    case "workout":
      return COLORS.success;
    case "competition":
      return COLORS.warning;
    case "meetup":
      return COLORS.secondary;
    case "seminar":
      return COLORS.primary;
    default:
      return COLORS.textSecondary;
  }
};

const formatEventDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatEventEndTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function EventDetails() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const [isJoining, setIsJoining] = useState(false);

  // Fetch event details
  const event = useQuery(
    api.events.getEventById,
    eventId ? { eventId: eventId as Id<"events"> } : "skip"
  );

  // Check user's RSVP status
  const userRsvpStatus = useQuery(
    api.events.getUserRsvpStatus,
    eventId && currentUser
      ? {
          eventId: eventId as Id<"events">,
          userId: currentUser._id as Id<"users">,
        }
      : "skip"
  );

  // RSVP mutation
  const rsvpToEvent = useMutation(api.events.rsvpToEvent);

  const handleBackPress = () => {
    router.back();
  };

  const handleJoinEvent = async () => {
    if (!currentUser) {
      Alert.alert("Error", "Please log in to join events");
      return;
    }

    // Users cannot join their own events
    if (event?.creatorId === currentUser._id) {
      Alert.alert(
        "Cannot Join",
        "You cannot join an event you created. You can edit or cancel your event from the event management section.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    // Only individuals can attend events
    if (currentUser.userType !== "individual") {
      Alert.alert(
        "Not Available",
        "Only individuals can join events. Gyms and brands can create events but cannot attend them.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    if (!eventId) return;

    setIsJoining(true);
    try {
      await rsvpToEvent({
        eventId: eventId as Id<"events">,
        userId: currentUser._id as Id<"users">,
        status: userRsvpStatus === "going" ? "not_going" : "going",
      });

      const action = userRsvpStatus === "going" ? "left" : "joined";
      Alert.alert("Success", `You have ${action} the event!`);
    } catch (error) {
      console.error("Error RSVPing to event:", error);
      Alert.alert("Error", "Failed to update RSVP. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  const eventTypeColor = getEventTypeColor(event.eventType);
  const eventTypeIcon = getEventTypeIcon(event.eventType);

  const isUserGoing = userRsvpStatus === "going";
  const isEventCreator = currentUser && event.creatorId === currentUser._id;
  const canJoin = currentUser?.userType === "individual" && !isEventCreator;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Type Badge */}
        <View
          style={[styles.eventTypeBadge, { backgroundColor: eventTypeColor }]}
        >
          <Ionicons
            name={eventTypeIcon as any}
            size={20}
            color={COLORS.white}
          />
          <Text style={styles.eventTypeText}>
            {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
          </Text>
        </View>

        {/* Event Title */}
        <Text style={styles.title}>{event.title}</Text>

        {/* Event Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color={COLORS.textMuted} />
            <View style={styles.detailContent}>
              <Text style={styles.detailText}>
                {formatEventDate(event.date)}
              </Text>
              {event.endDate && (
                <Text style={styles.detailSubtext}>
                  Ends at {formatEventEndTime(event.endDate)}
                </Text>
              )}
            </View>
          </View>

          {event.location && (
            <View style={styles.detailRow}>
              <Ionicons
                name="location-outline"
                size={20}
                color={COLORS.textMuted}
              />
              <Text style={styles.detailText}>
                {[event.location.city, event.location.state, event.location.country]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons
              name="people-outline"
              size={20}
              color={COLORS.textMuted}
            />
            <Text style={styles.detailText}>
              {event.rsvpCount} attending
              {event.maxParticipants &&
                ` • ${event.maxParticipants} max capacity`}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this event</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* Creator Info */}
        {event.creator && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organizer</Text>
            <View style={styles.creatorContainer}>
              <Image
                source={
                  event.creator.avatarUrl
                    ? { uri: event.creator.avatarUrl }
                    : require("@/assets/images/logo.png")
                }
                style={styles.creatorAvatar}
              />
              <View style={styles.creatorInfo}>
                <Text style={styles.creatorName}>
                  {event.creator.username}
                  {event.creator.isVerified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={COLORS.secondary}
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </Text>
                <Text style={styles.creatorType}>
                  {event.creator.userType.charAt(0).toUpperCase() +
                    event.creator.userType.slice(1)}
                  {event.creator.location?.city &&
                    ` • ${event.creator.location.city}`}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Join Button */}
      {canJoin ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.joinButton, isUserGoing && styles.joinButtonActive]}
            onPress={handleJoinEvent}
            disabled={isJoining}
          >
            <Ionicons
              name={isUserGoing ? "checkmark-circle" : "add-circle"}
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.joinButtonText}>
              {isJoining
                ? "Updating..."
                : isUserGoing
                  ? "Leave Event"
                  : "Join Event"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : isEventCreator ? (
        <View style={styles.buttonContainer}>
          <View style={styles.infoMessage}>
            <Ionicons
              name="settings-outline"
              size={20}
              color={COLORS.secondary}
            />
            <Text style={[styles.infoText, { color: COLORS.secondary }]}>
              You are the creator of this event
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <View style={styles.infoMessage}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={COLORS.textMuted}
            />
            <Text style={styles.infoText}>
              Only individuals can join events
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: COLORS.white,
  },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xxl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    ...FONTS.bold,
    color: COLORS.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  eventTypeBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    alignSelf: "flex-start" as const,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    margin: SPACING.lg,
    marginBottom: SPACING.md,
  },
  eventTypeText: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.medium,
    color: COLORS.white,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    ...FONTS.bold,
    color: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    lineHeight: 42,
  },
  detailsContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  detailRow: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: SPACING.md,
  },
  detailContent: {
    flex: 1,
  },
  detailText: {
    fontSize: FONTS.sizes.md,
    ...FONTS.medium,
    color: COLORS.text,
    flex: 1,
  },
  detailSubtext: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.regular,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    ...FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONTS.sizes.md,
    ...FONTS.regular,
    color: COLORS.text,
    lineHeight: 24,
  },
  creatorContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  creatorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: FONTS.sizes.md,
    ...FONTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  creatorType: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.regular,
    color: COLORS.textMuted,
  },
  buttonContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  joinButton: {
    backgroundColor: COLORS.secondary,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    ...SHADOWS.button,
  },
  joinButtonActive: {
    backgroundColor: COLORS.success,
  },
  joinButtonText: {
    fontSize: FONTS.sizes.md,
    ...FONTS.medium,
    color: COLORS.white,
  },
  infoMessage: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  infoText: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.regular,
    color: COLORS.textMuted,
  },
};
