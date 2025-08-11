import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "@/constants/theme";

export interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  leftComponent?: React.ReactNode;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
  titleColor?: string;
}

export default function AppHeader({
  title = "",
  showBackButton = false,
  onBackPress,
  leftIcon,
  onLeftPress,
  leftComponent,
  rightIcon,
  onRightPress,
  rightComponent,
  backgroundColor = COLORS.white,
  titleColor = COLORS.text,
}: AppHeaderProps) {
  const handleLeftPress = () => {
    if (showBackButton && onBackPress) {
      onBackPress();
    } else if (onLeftPress) {
      onLeftPress();
    }
  };

  const renderLeftButton = () => {
    if (leftComponent) {
      return leftComponent;
    }

    if (showBackButton) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleLeftPress}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-back" size={22} color={titleColor} />
        </TouchableOpacity>
      );
    }

    if (leftIcon) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onLeftPress}
          activeOpacity={0.6}
        >
          <Ionicons name={leftIcon} size={22} color={titleColor} />
        </TouchableOpacity>
      );
    }

    // Return empty placeholder to maintain spacing
    return <View style={styles.placeholder} />;
  };

  const renderRightButton = () => {
    if (rightComponent) {
      return rightComponent;
    }

    if (rightIcon) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onRightPress}
          activeOpacity={0.6}
        >
          <Ionicons name={rightIcon} size={22} color={titleColor} />
        </TouchableOpacity>
      );
    }

    // Return empty placeholder to maintain spacing
    return <View style={styles.placeholder} />;
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor }]}
    >
      <View style={[styles.header, { backgroundColor }]}>
        {renderLeftButton()}

        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>

        {renderRightButton()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    flex: 1,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: COLORS.background,
  },
  placeholder: {
    width: 44,
    height: 44,
  },
});
