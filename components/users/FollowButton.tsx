import React, { useState } from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

interface FollowButtonProps {
  isFollowing: boolean;
  isCurrentUser?: boolean;
  isPending?: boolean;
  userType?: "individual" | "gym" | "brand";
  onPress: () => Promise<void> | void;
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
}

export default function FollowButton({
  isFollowing,
  isCurrentUser = false,
  isPending = false,
  userType = "individual",
  onPress,
  variant = "primary",
  size = "medium",
}: FollowButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading || isCurrentUser) return;

    setLoading(true);
    try {
      await onPress();
    } finally {
      setLoading(false);
    }
  };

  if (isCurrentUser) {
    return (
      <TouchableOpacity
        style={[styles.button, styles.editButton, styles[size]]}
        disabled
      >
        <Ionicons name="settings-outline" size={16} color={COLORS.text} />
        <Text style={[styles.buttonText, styles.editButtonText]}>
          Edit Profile
        </Text>
      </TouchableOpacity>
    );
  }

  const getButtonText = () => {
    if (isPending) return "Pending";
    if (isFollowing) return userType === "gym" ? "Member" : "Following";

    switch (userType) {
      case "gym":
        return "Join";
      case "brand":
        return "Follow";
      case "individual":
      default:
        return "Follow";
    }
  };

  const getButtonIcon = () => {
    if (isPending) return "hourglass-outline";
    if (isFollowing) {
      return userType === "gym"
        ? "checkmark-circle-outline"
        : "person-remove-outline";
    }

    switch (userType) {
      case "gym":
        return "add-circle-outline";
      case "brand":
        return "add-outline";
      case "individual":
      default:
        return "person-add-outline";
    }
  };

  const buttonStyle = [
    styles.button,
    styles[size],
    variant === "primary" ? styles.primaryButton : styles.secondaryButton,
    isFollowing && styles.followingButton,
    isPending && styles.pendingButton,
    loading && styles.loadingButton,
  ];

  const textStyle = [
    styles.buttonText,
    variant === "primary" ? styles.primaryText : styles.secondaryText,
    isFollowing && styles.followingText,
    isPending && styles.pendingText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? COLORS.white : COLORS.primary}
        />
      ) : (
        <>
          <Ionicons
            name={getButtonIcon() as any}
            size={size === "small" ? 14 : 16}
            color={
              variant === "primary" && !isFollowing && !isPending
                ? COLORS.white
                : COLORS.primary
            }
          />
          <Text style={textStyle}>{getButtonText()}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = {
  button: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderRadius: BORDER_RADIUS.sm,
    gap: 6,
  },
  small: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    minWidth: 80,
  },
  medium: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minWidth: 100,
  },
  large: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  followingButton: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  pendingButton: {
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  editButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingButton: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.medium,
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.primary,
  },
  followingText: {
    color: COLORS.white,
  },
  pendingText: {
    color: COLORS.white,
  },
  editButtonText: {
    color: COLORS.text,
  },
};
