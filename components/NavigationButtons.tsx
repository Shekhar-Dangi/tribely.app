import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/theme";

interface NavigationButtonsProps {
  onSkip?: () => void;
  onBack?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextText?: string;
  showSkip?: boolean;
  showBack?: boolean;
}

export default function NavigationButtons({
  onSkip,
  onBack,
  onNext,
  nextDisabled = false,
  nextText = "Next",
  showSkip = true,
  showBack = false,
}: NavigationButtonsProps) {
  return (
    <View style={styles.container}>
      {showSkip && onSkip && (
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      )}

      {showBack && onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[
          styles.nextButton,
          nextDisabled && styles.nextButtonDisabled,
          showSkip || showBack ? { flex: 1 } : { width: "100%" },
        ]}
        onPress={onNext}
        disabled={nextDisabled}
      >
        <Text
          style={[
            styles.nextButtonText,
            nextDisabled && styles.nextButtonTextDisabled,
          ]}
        >
          {nextText}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  skipButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: "center",
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  skipButtonText: {
    fontSize: FONTS.sizes.md,
    ...FONTS.medium,
    color: COLORS.text,
  },
  backButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: "center",
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backButtonText: {
    fontSize: FONTS.sizes.md,
    ...FONTS.medium,
    color: COLORS.text,
  },
  nextButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: "center",
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.secondary,
    ...SHADOWS.small,
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  nextButtonText: {
    fontSize: FONTS.sizes.md,
    ...FONTS.medium,
    color: COLORS.white,
  },
  nextButtonTextDisabled: {
    color: COLORS.textMuted,
  },
});
