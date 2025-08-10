import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { COLORS } from "@/constants/theme";
import { formatLocation } from "@/utils/location";
import { UserType } from "@/types/schema";

interface FilterState {
  userType: UserType | "all";
  city: string;
  state: string;
}

interface UserProfile {
  _id: string;
  username: string;
  userType: UserType;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  profile?: any;
}

export default function ExploreScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    userType: "all",
    city: "",
    state: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "suggestions">(
    "search"
  );

  // Search query
  const searchResults = useQuery(
    api.explore.searchUsers,
    searchTerm.length > 0
      ? {
          searchTerm,
          userType: filters.userType === "all" ? undefined : filters.userType,
          city: filters.city || undefined,
          state: filters.state || undefined,
          limit: 20,
        }
      : "skip"
  );

  // All users query (for when no search term)
  const allUsers = useQuery(
    api.explore.getAllUsers,
    searchTerm.length === 0
      ? {
          userType: filters.userType === "all" ? undefined : filters.userType,
          city: filters.city || undefined,
          state: filters.state || undefined,
          limit: 20,
        }
      : "skip"
  );

  // Location-based suggestions
  const nearbyIndividuals = useQuery(api.explore.getNearbyIndividuals, {
    limit: 10,
  });

  const nearbyGyms = useQuery(api.explore.getNearbyGyms, {
    limit: 8,
  });

  const nearbyBrands = useQuery(api.explore.getNearbyBrands, {
    limit: 6,
  });

  // Dropdown data
  const uniqueStates = useQuery(api.explore.getUniqueStates);
  const uniqueCities = useQuery(
    api.explore.getUniqueCities,
    filters.state ? { state: filters.state } : {}
  );

  const handleClearFilters = () => {
    setFilters({
      userType: "all",
      city: "",
      state: "",
    });
  };

  const hasActiveFilters =
    filters.userType !== "all" || filters.city || filters.state;

  const displayResults = searchTerm.length > 0 ? searchResults : allUsers;

  const renderUserCard = (user: UserProfile) => (
    <TouchableOpacity key={user._id} style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <View style={styles.userDetails}>
            <Text style={styles.username}>@{user.username}</Text>
            <View style={styles.userTypeContainer}>
              <Text style={styles.userType}>
                {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
              </Text>
            </View>
          </View>
          {user.location && (
            <View style={styles.locationContainer}>
              <Ionicons
                name="location-outline"
                size={14}
                color={COLORS.darkGray}
              />
              <Text style={styles.locationText}>
                {formatLocation(user.location)}
              </Text>
            </View>
          )}
        </View>

        {user.profile && (
          <View style={styles.profileInfo}>
            {user.userType === "individual" && user.profile.fullName && (
              <Text style={styles.profileDetail}>{user.profile.fullName}</Text>
            )}
            {user.userType === "gym" && user.profile.gymName && (
              <Text style={styles.profileDetail}>{user.profile.gymName}</Text>
            )}
            {user.userType === "brand" && user.profile.companyName && (
              <Text style={styles.profileDetail}>
                {user.profile.companyName}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSuggestionSection = (
    title: string,
    users: UserProfile[] | undefined,
    icon: string
  ) => {
    if (!users || users.length === 0) return null;

    return (
      <View style={styles.suggestionSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name={icon as any} size={20} color={COLORS.secondary} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {users.map((user) => (
            <TouchableOpacity key={user._id} style={styles.suggestionCard}>
              <Text style={styles.suggestionUsername}>@{user.username}</Text>
              {user.location && (
                <Text style={styles.suggestionLocation}>
                  {formatLocation(user.location)}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.darkGray} />
          <TextInput
            style={styles.searchInput}
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

        {/* Filter Toggle */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            hasActiveFilters && styles.filterButtonActive,
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name="filter"
            size={20}
            color={hasActiveFilters ? COLORS.white : COLORS.darkGray}
          />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* User Type Filter */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {["all", "individual", "gym", "brand"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    filters.userType === type && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setFilters((prev) => ({ ...prev, userType: type as any }))
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.userType === type && styles.filterChipTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Location Filters */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>State:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  !filters.state && styles.filterChipActive,
                ]}
                onPress={() =>
                  setFilters((prev) => ({ ...prev, state: "", city: "" }))
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    !filters.state && styles.filterChipTextActive,
                  ]}
                >
                  All States
                </Text>
              </TouchableOpacity>
              {uniqueStates?.map((state: string) => (
                <TouchableOpacity
                  key={state}
                  style={[
                    styles.filterChip,
                    filters.state === state && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setFilters((prev) => ({ ...prev, state, city: "" }))
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.state === state && styles.filterChipTextActive,
                    ]}
                  >
                    {state}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {filters.state && (
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>City:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    !filters.city && styles.filterChipActive,
                  ]}
                  onPress={() => setFilters((prev) => ({ ...prev, city: "" }))}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      !filters.city && styles.filterChipTextActive,
                    ]}
                  >
                    All Cities
                  </Text>
                </TouchableOpacity>
                {uniqueCities?.map((city: string) => (
                  <TouchableOpacity
                    key={city}
                    style={[
                      styles.filterChip,
                      filters.city === city && styles.filterChipActive,
                    ]}
                    onPress={() => setFilters((prev) => ({ ...prev, city }))}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.city === city && styles.filterChipTextActive,
                      ]}
                    >
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={handleClearFilters}
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "search" && styles.activeTab]}
          onPress={() => setActiveTab("search")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "search" && styles.activeTabText,
            ]}
          >
            {searchTerm ? "Search Results" : "Browse"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "suggestions" && styles.activeTab]}
          onPress={() => setActiveTab("suggestions")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "suggestions" && styles.activeTabText,
            ]}
          >
            Suggestions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "search" ? (
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
                  name="search-outline"
                  size={64}
                  color={COLORS.lightGray}
                />
                <Text style={styles.emptyStateTitle}>
                  {searchTerm ? "No results found" : "No users found"}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchTerm
                    ? "Try adjusting your search terms or filters"
                    : "Try changing your filters"}
                </Text>
              </View>
            ) : (
              displayResults.map(renderUserCard)
            )}
          </View>
        ) : (
          <View style={styles.suggestions}>
            {renderSuggestionSection(
              "People Near You",
              nearbyIndividuals,
              "people-outline"
            )}
            {renderSuggestionSection(
              "Gyms Near You",
              nearbyGyms,
              "fitness-outline"
            )}
            {renderSuggestionSection(
              "Brands Near You",
              nearbyBrands,
              "business-outline"
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  searchSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.text,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
  clearFiltersButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.darkGray,
  },
  activeTabText: {
    color: COLORS.text,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  searchResults: {
    paddingHorizontal: 20,
  },
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userInfo: {
    gap: 8,
  },
  userHeader: {
    gap: 4,
  },
  userDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  userTypeContainer: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  userType: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.white,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  profileInfo: {
    marginTop: 4,
  },
  profileDetail: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  suggestions: {
    gap: 24,
  },
  suggestionSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
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
  suggestionCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 140,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionUsername: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  suggestionLocation: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 20,
  },
  loader: {
    paddingVertical: 40,
  },
});
