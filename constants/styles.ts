import { StyleSheet } from "react-native";
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from "./theme";

export const tabs = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    paddingTop: 25,
  },
});

export const union = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.md,
    ...FONTS.regular,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  textInputContainer: {
    flex: 1,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  textInputLabel: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  flexRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.xs,
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  buttonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.xs,
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  buttonText: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.medium,
    color: COLORS.white,
  },
  buttonTextSecondary: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.medium,
    color: COLORS.text,
  },
  removeButton: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    width: 24,
    height: 24,

    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    ...FONTS.bold,
  },
});

export const onboard = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.lg,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: FONTS.sizes.md,
    ...FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  addButton: {
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: "dashed",
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  addButtonText: {
    fontSize: FONTS.sizes.md,
    ...FONTS.medium,
    color: COLORS.secondary,
  },
  selectionCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    ...SHADOWS.small,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectionCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: `${COLORS.secondary}05`,
  },
  selectionCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectionCardIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  selectionCardIconSelected: {
    backgroundColor: `${COLORS.secondary}15`,
  },
  selectionCardTextContainer: {
    flex: 1,
  },
  selectionCardTitle: {
    fontSize: FONTS.sizes.lg,
    ...FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  selectionCardSubtitle: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.medium,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  selectionCardDescription: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export const texts = StyleSheet.create({
  title: {
    fontSize: 24,
    color: COLORS.text,
  },
});

export const profile = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    paddingTop: SPACING.xxxl,
  },

  // Profile Header
  profileHeader: {
    flexDirection: "row",
    gap: SPACING.lg,
    ...SHADOWS.small,
  },

  // Avatar Components
  avatarContainer: {
    alignItems: "flex-start",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.secondary,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.secondary,
  },
  avatarText: {
    fontSize: 48,
    ...FONTS.bold,
    color: COLORS.text,
  },

  // User Info Section
  topDetails: {
    flex: 1,
    alignItems: "flex-start",
  },
  userInfo: {
    alignItems: "flex-start",
    marginBottom: SPACING.lg,
    flex: 1,
  },
  userName: {
    fontSize: FONTS.sizes.lg,
    ...FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  userHandle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    ...FONTS.regular,
  },
  userBio: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    ...FONTS.regular,
    marginTop: SPACING.sm,
    lineHeight: 20,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  followButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 100,
    alignItems: "center",
  },
  followButtonText: {
    color: COLORS.secondary,
    fontSize: FONTS.sizes.md,
    ...FONTS.medium,
  },
  trainButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 100,
    alignItems: "center",
    ...SHADOWS.button,
  },
  trainButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    ...FONTS.medium,
  },

  // Tab Navigation
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: COLORS.secondary,
  },
  tabText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  activeTabText: {
    color: COLORS.secondary,
    ...FONTS.bold,
  },

  // Content Areas
  tabContent: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  contentContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  contentPlaceholder: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    textAlign: "center",
    ...FONTS.regular,
    marginTop: SPACING.xxl,
  },

  // Stats Section
  statsContainer: {
    // backgroundColor: COLORS.background,
    // margin: SPACING.md,
    // borderRadius: BORDER_RADIUS.md,
    // padding: SPACING.lg,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    // marginBottom: SPACING.sm,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: FONTS.sizes.lg,
    ...FONTS.bold,
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    ...FONTS.medium,
    marginTop: SPACING.xs,
  },

  // Section Headers
  sectionHeader: {
    fontSize: FONTS.sizes.lg,
    ...FONTS.bold,
    color: COLORS.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },

  // Card Styles for Data
  dataCard: {
    ...SHADOWS.small,
  },
  dataCardTitle: {
    fontSize: FONTS.sizes.md,
    // ...FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  dataCardSubtitle: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.medium,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  dataCardDescription: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  dataCardDate: {
    fontSize: FONTS.sizes.xs,
    ...FONTS.regular,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  activeBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.xs,
    alignSelf: "flex-start",
    marginTop: SPACING.xs,
  },
  activeBadgeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    ...FONTS.medium,
  },

  // Missing styles for profile
  userType: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    marginVertical: 4,
  },
  userLocation: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  primaryButton: {
    display: "flex",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.xs,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    ...SHADOWS.button,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    ...FONTS.medium,
  },
  secondaryButton: {
    display: "flex",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.xs,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: FONTS.sizes.md,
    ...FONTS.medium,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
});
