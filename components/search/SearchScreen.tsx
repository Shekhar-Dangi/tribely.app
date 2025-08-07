import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "@/constants/theme";
import { UserList } from "@/components/users";
import { UserWithProfile } from "@/types/schema";

interface SearchScreenProps {
  onUserSelect?: (user: UserWithProfile) => void;
}

export default function SearchScreen({ onUserSelect }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "individual" | "gym" | "brand"
  >("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search users by username
  const searchResults = useQuery(
    api.users.searchUsers,
    debouncedQuery.length >= 2
      ? {
          query: debouncedQuery,
          userType: selectedFilter === "all" ? undefined : selectedFilter,
        }
      : "skip"
  ) as UserWithProfile[] | undefined;

  // Get trending users
  const trendingUsers = useQuery(api.users.getTrendingUsers, {
    limit: 10,
    userType: selectedFilter === "all" ? undefined : selectedFilter,
  }) as UserWithProfile[] | undefined;

  const filters = [
    { key: "all", label: "All", icon: "people-outline" },
    { key: "individual", label: "People", icon: "person-outline" },
    { key: "gym", label: "Gyms", icon: "fitness-outline" },
    { key: "brand", label: "Brands", icon: "business-outline" },
  ] as const;

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
  };

  const displayUsers =
    debouncedQuery.length >= 2 ? searchResults : trendingUsers;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Ionicons
              name={filter.icon as any}
              size={16}
              color={
                selectedFilter === filter.key ? COLORS.white : COLORS.primary
              }
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <View style={styles.resultsContainer}>
        {debouncedQuery.length >= 2 && (
          <Text style={styles.sectionTitle}>
            Search Results{" "}
            {searchResults?.length ? `(${searchResults.length})` : ""}
          </Text>
        )}

        {debouncedQuery.length < 2 && (
          <Text style={styles.sectionTitle}>
            {selectedFilter === "all"
              ? "Trending Users"
              : `Trending ${filters.find((f) => f.key === selectedFilter)?.label}`}
          </Text>
        )}

        {displayUsers && displayUsers.length > 0 ? (
          <UserList
            users={displayUsers}
            variant="compact"
            onUserPress={onUserSelect}
            emptyMessage="No users found"
          />
        ) : debouncedQuery.length >= 2 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="search-outline"
              size={48}
              color={COLORS.textMuted}
            />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyText}>
              Try searching with a different keyword or adjust your filters
            </Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="trending-up-outline"
              size={48}
              color={COLORS.textMuted}
            />
            <Text style={styles.emptyTitle}>No trending users yet</Text>
            <Text style={styles.emptyText}>
              Check back later to see who&apos;s trending in the community
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    ...FONTS.regular,
  },
  clearButton: {
    padding: 2,
  },
  filtersContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filtersContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  filterButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    ...FONTS.medium,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    ...FONTS.bold,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    ...FONTS.bold,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: "center" as const,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    ...FONTS.regular,
    textAlign: "center" as const,
    lineHeight: 20,
  },
};
