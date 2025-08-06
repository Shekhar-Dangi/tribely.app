import { StyleSheet, TextInput } from "react-native";
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
