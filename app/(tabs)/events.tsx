import React, { useState } from "react";
import { View, ScrollView, Text, Alert, RefreshControl } from "react-native";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import EventsHeader from "@/components/events/EventsHeader";
import EventCard from "@/components/events/EventCard";
import EventSkeleton from "@/components/events/EventSkeleton";
import { COLORS, SPACING } from "@/constants/theme";

export default function Events() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch nearby events
  const events = useQuery(api.events.getNearbyEvents, {
    limit: 10,
    userLocation: currentUser?.location,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // The query will automatically refetch when we set refreshing to false
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCreateEvent = () => {
    if (!currentUser) {
      Alert.alert("Error", "Please log in to create events");
      return;
    }

    // All user types can now create events
    router.push("/create-event");
  };

  const handleMyEvents = () => {
    if (!currentUser) {
      Alert.alert("Error", "Please log in to view your events");
      return;
    }

    // All user types can now view their events
    // TODO: Navigate to my events screen
    Alert.alert("Coming Soon", "My events view will be available soon!");
  };

  const handleEventPress = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <EventsHeader
          onCreateEventPress={handleCreateEvent}
          onMyEventsPress={handleMyEvents}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EventsHeader
        onCreateEventPress={handleCreateEvent}
        onMyEventsPress={handleMyEvents}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.secondary}
            colors={[COLORS.secondary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Events</Text>
          <Text style={styles.sectionSubtitle}>
            Discover events happening around you
          </Text>
        </View>

        {/* Events List */}
        {events === undefined ? (
          // Loading skeletons
          <>
            <EventSkeleton />
            <EventSkeleton />
            <EventSkeleton />
          </>
        ) : events.length === 0 ? (
          // Empty state
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Events Found</Text>
            <Text style={styles.emptyDescription}>
              No events are happening near you right now. Be the first to create
              one!
            </Text>
          </View>
        ) : (
          // Events list
          events.map((event: any) => (
            <EventCard
              key={event._id}
              event={event}
              onPress={() => handleEventPress(event._id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: SPACING.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: "center" as const,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: "center" as const,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center" as const,
    lineHeight: 20,
  },
};
