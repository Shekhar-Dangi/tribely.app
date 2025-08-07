import React from "react";
import { View, FlatList, Text, RefreshControl } from "react-native";
import { COLORS, FONTS, SPACING } from "@/constants/theme";
import { UserWithProfile } from "@/types/schema";
import UserCard from "./UserCard";

interface UserListProps {
  users: UserWithProfile[];
  variant?: "compact" | "full";
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onUserPress?: (user: UserWithProfile) => void;
  emptyMessage?: string;
}

export default function UserList({
  users,
  variant = "compact",
  loading = false,
  refreshing = false,
  onRefresh,
  onUserPress,
  emptyMessage = "No users found",
}: UserListProps) {
  const renderUser = ({ item }: { item: UserWithProfile }) => (
    <UserCard
      user={item}
      variant={variant}
      onPress={() => onUserPress?.(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderUser}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          ) : undefined
        }
        ListEmptyComponent={!loading ? renderEmpty : null}
      />
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  list: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    ...FONTS.regular,
    textAlign: "center" as const,
  },
};
