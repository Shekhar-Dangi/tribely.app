import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "@/constants/theme";

export default function EventSkeleton() {
  return (
    <View style={styles.card}>
      {/* Event Type Badge Skeleton */}
      <View style={styles.badgeSkeleton} />

      <View style={styles.content}>
        {/* Title Skeleton */}
        <View style={styles.titleSkeleton} />
        <View style={[styles.titleSkeleton, styles.titleSkeletonShort]} />

        {/* Description Skeleton */}
        <View style={styles.descriptionSkeleton} />
        <View
          style={[styles.descriptionSkeleton, styles.descriptionSkeletonMedium]}
        />
        <View
          style={[styles.descriptionSkeleton, styles.descriptionSkeletonShort]}
        />

        {/* Details Skeleton */}
        <View style={styles.detailContainer}>
          <View style={styles.detailSkeleton} />
          <View style={styles.detailSkeleton} />
          <View style={styles.detailSkeleton} />
        </View>

        {/* Creator Skeleton */}
        <View style={styles.creatorContainer}>
          <View style={styles.avatarSkeleton} />
          <View style={styles.creatorInfo}>
            <View style={styles.creatorNameSkeleton} />
            <View style={styles.creatorTypeSkeleton} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeSkeleton: {
    width: 100,
    height: 28,
    backgroundColor: COLORS.lightGray,
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderBottomRightRadius: BORDER_RADIUS.md,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  titleSkeleton: {
    height: 20,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.xs,
    marginBottom: SPACING.sm,
  },
  titleSkeletonShort: {
    width: "70%",
  },
  descriptionSkeleton: {
    height: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.xs,
    marginBottom: SPACING.xs,
  },
  descriptionSkeletonMedium: {
    width: "90%",
  },
  descriptionSkeletonShort: {
    width: "60%",
  },
  detailContainer: {
    gap: SPACING.sm,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  detailSkeleton: {
    height: 14,
    width: "80%",
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.xs,
  },
  creatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  avatarSkeleton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorNameSkeleton: {
    height: 14,
    width: "60%",
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.xs,
    marginBottom: SPACING.xs,
  },
  creatorTypeSkeleton: {
    height: 12,
    width: "40%",
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.xs,
  },
});
