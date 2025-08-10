import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, SPACING } from "../../constants/theme";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <View style={[styles.container, {}]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    ...FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    ...FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});
