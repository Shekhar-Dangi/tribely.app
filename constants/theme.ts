export const COLORS = {
  primary: "#1a1a1a",
  secondary: "#7d9ae8ff",

  white: "#ffffff",
  background: "#fafafa",

  text: "#1a1a1a",
  textSecondary: "#666666",
  textMuted: "#999999",

  lightGray: "#f5f5f5",
  mediumGray: "#e0e0e0",
  darkGray: "#555555",
  black: "#000000",

  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",

  googleBlue: "#4285F4",
  premium: "#ffd700",

  cardBg: "#ffffff",
  border: "#e5e7eb",
  shadow: "rgba(0, 0, 0, 0.1)",
};

export const FONTS = {
  regular: {
    fontFamily: "Inter",
    fontWeight: "400" as const,
  },
  medium: {
    fontFamily: "Inter",
    fontWeight: "500" as const,
  },
  bold: {
    fontFamily: "Inter",
    fontWeight: "700" as const,
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 36,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 60,
};

export const SHADOWS = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  button: {
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};
