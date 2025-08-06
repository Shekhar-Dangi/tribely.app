import React from "react";
import { Pressable, Text } from "react-native";
import { union } from "@/constants/styles";

interface AddButtonProps {
  onPress: () => void;
  title: string;
  style?: "primary" | "secondary";
}

export default function AddButton({
  onPress,
  title,
  style = "secondary",
}: AddButtonProps) {
  const buttonStyle =
    style === "primary" ? union.button : union.buttonSecondary;
  const textStyle =
    style === "primary" ? union.buttonText : union.buttonTextSecondary;

  return (
    <Pressable style={buttonStyle} onPress={onPress}>
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  );
}
