import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { onboard } from "@/constants/styles";
import { COLORS } from "@/constants/theme";

interface SelectionCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  isSelected: boolean;
  onPress: () => void;
}

export default function SelectionCard({
  title,
  subtitle,
  description,
  icon,
  isSelected,
  onPress,
}: SelectionCardProps) {
  return (
    <Pressable
      style={[
        onboard.selectionCard,
        isSelected && onboard.selectionCardSelected,
      ]}
      onPress={onPress}
    >
      <View style={onboard.selectionCardContent}>
        <View
          style={[
            onboard.selectionCardIcon,
            isSelected && onboard.selectionCardIconSelected,
          ]}
        >
          <Ionicons
            name={icon}
            size={24}
            color={isSelected ? COLORS.secondary : COLORS.textSecondary}
          />
        </View>

        <View style={onboard.selectionCardTextContainer}>
          <Text style={onboard.selectionCardTitle}>{title}</Text>
          <Text style={onboard.selectionCardSubtitle}>{subtitle}</Text>
          <Text style={onboard.selectionCardDescription}>{description}</Text>
        </View>
      </View>
    </Pressable>
  );
}
