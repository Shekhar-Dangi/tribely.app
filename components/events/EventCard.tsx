import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "@/constants/theme";

interface EventCardProps {
  event: {
    _id: string;
    title: string;
    description: string;
    date: number;
    endDate?: number;
    location?: {
      city?: string;
      state?: string;
      country?: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    maxParticipants?: number;
    eventType: "workout" | "competition" | "meetup" | "seminar";
    rsvpCount: number;
    creator: {
      username: string;
      avatarUrl?: string;
      userType: "gym" | "brand";
      location?: {
        city?: string;
        state?: string;
      };
      profile?: any;
    } | null;
  };
  onPress: () => void;
}

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
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow =
    date.toDateString() ===
    new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

  if (isToday) {
    return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } else if (isTomorrow) {
    return `Tomorrow, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } else {
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

export default function EventCard({ event, onPress }: EventCardProps) {
  const eventTypeColor = getEventTypeColor(event.eventType);
  const eventTypeIcon = getEventTypeIcon(event.eventType);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Event Type Badge */}
      <View
        style={[styles.eventTypeBadge, { backgroundColor: eventTypeColor }]}
      >
        <Ionicons name={eventTypeIcon as any} size={16} color={COLORS.white} />
        <Text style={styles.eventTypeText}>
          {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
        </Text>
      </View>

      {/* Event Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        <Text style={styles.description} numberOfLines={3}>
          {event.description}
        </Text>

        {/* Event Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.detailText}>{formatEventDate(event.date)}</Text>
          </View>

          {event.location && (
            <View style={styles.detailRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={COLORS.textMuted}
              />
              <Text style={styles.detailText} numberOfLines={1}>
                {[event.location.city, event.location.state, event.location.country]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons
              name="people-outline"
              size={16}
              color={COLORS.textMuted}
            />
            <Text style={styles.detailText}>
              {event.rsvpCount} attending
              {event.maxParticipants && ` • ${event.maxParticipants} max`}
            </Text>
          </View>
        </View>

        {/* Creator Info */}
        {event.creator && (
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
              <Text style={styles.creatorName}>{event.creator.username}</Text>
              <Text style={styles.creatorType}>
                {event.creator.userType.charAt(0).toUpperCase() +
                  event.creator.userType.slice(1)}
                {event.creator.location?.city &&
                  ` • ${event.creator.location.city}`}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = {
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  eventTypeBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    alignSelf: "flex-start" as const,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderBottomRightRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  eventTypeText: {
    fontSize: FONTS.sizes.xs,
    ...FONTS.medium,
    color: COLORS.white,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    ...FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  description: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.regular,
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  detailsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: SPACING.sm,
  },
  detailText: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.regular,
    color: COLORS.textMuted,
    flex: 1,
  },
  creatorContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.medium,
    color: COLORS.text,
  },
  creatorType: {
    fontSize: FONTS.sizes.xs,
    ...FONTS.regular,
    color: COLORS.textMuted,
  },
};
