import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { api } from "@/convex/_generated/api";
import { COLORS, SPACING } from "@/constants/theme";
import { formatLocation } from "@/utils/location";
import { AppHeader } from "@/components/common";

interface UserProfile {
  _id: string;
  username: string;
  userType: "individual" | "gym" | "brand";
  location?: {
    city?: string;
    state?: string;
  };
  avatarUrl?: string;
  bio?: string;
}

export default function ExploreScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Search query
  const searchResults = useQuery(
    api.explore.searchUsers,
    searchTerm.length > 0
      ? {
          searchTerm,
          limit: 20,
        }
      : "skip"
  );

  // Location-based suggestions
  const nearbyIndividuals = useQuery(api.explore.getNearbyIndividuals, {
    limit: 3,
  });

  const nearbyGyms = useQuery(api.explore.getNearbyGyms, {
    limit: 3,
  });

  const nearbyBrands = useQuery(api.explore.getNearbyBrands, {
    limit: 3,
  });

  const displayResults = searchResults;

  const renderUserCard = (user: UserProfile) => (
    <TouchableOpacity
      key={user._id}
      style={styles.userCard}
      onPress={() => router.push(`/user/${user.username}`)}
    >
      <View style={styles.userAvatar}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={20} color={COLORS.textSecondary} />
          </View>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>@{user.username}</Text>
        <Text style={styles.userType}>
          {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
        </Text>
        {user.bio && <Text style={styles.userBio}>{user.bio}</Text>}
        {user.location && (
          <Text style={styles.userLocation}>
            {formatLocation(user.location)}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  const renderSuggestionRow = (
    title: string,
    users: UserProfile[] | undefined,
    icon: string
  ) => {
    if (!users || users.length === 0) return null;

    return (
      <View style={styles.suggestionSection}>
        <View style={styles.sectionHeader}>
          {/* <Ionicons name={icon as any} size={20} color={COLORS.secondary} /> */}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScroll}
        >
          {users.map((user) => (
            <TouchableOpacity
              key={user._id}
              style={styles.suggestionItem}
              onPress={() => router.push(`/user/${user.username}`)}
            >
              <View style={styles.suggestionAvatar}>
                {user.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={styles.suggestionAvatarImage}
                  />
                ) : (
                  <View style={styles.suggestionAvatarPlaceholder}>
                    <Ionicons
                      name="person"
                      size={32}
                      color={COLORS.textSecondary}
                    />
                  </View>
                )}
              </View>
              <Text style={styles.suggestionUsername}>@{user.username}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Explore" leftIcon="search" rightIcon="filter" />

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.darkGray} />
          <TextInput
            style={[styles.searchInput]}
            placeholder="Search by username..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor={COLORS.darkGray}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.darkGray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {searchTerm.length > 0 ? (
          // Search Results (LinkedIn style)
          <View style={styles.searchResults}>
            {displayResults === undefined ? (
              <ActivityIndicator
                size="large"
                color={COLORS.secondary}
                style={styles.loader}
              />
            ) : displayResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="search"
                  size={48}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.emptyStateText}>No users found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try adjusting your search terms
                </Text>
              </View>
            ) : (
              displayResults.map(renderUserCard)
            )}
          </View>
        ) : (
          // Suggestions (Instagram style)
          <View style={styles.suggestions}>
            {renderSuggestionRow(
              "People Near You",
              nearbyIndividuals,
              "person"
            )}
            {renderSuggestionRow("Gyms Near You", nearbyGyms, "fitness")}
            {renderSuggestionRow("Brands Near You", nearbyBrands, "business")}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  searchResults: {
    paddingHorizontal: 20,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  userType: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: "500",
  },
  userBio: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 18,
  },
  userLocation: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  suggestions: {
    display: "flex",
    gap: SPACING.xl,
  },
  suggestionSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  suggestionItem: {
    alignItems: "center",
    marginRight: 20,
    width: 80,
  },
  suggestionAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    marginBottom: 8,
  },
  suggestionAvatarImage: {
    width: "100%",
    height: "100%",
  },
  suggestionAvatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionUsername: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 20,
  },
  loader: {
    paddingVertical: 40,
  },
});
