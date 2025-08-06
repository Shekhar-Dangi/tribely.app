import { StyleSheet } from "react-native";
import { COLORS } from "./theme";

export const tabs = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});

export const texts = StyleSheet.create({
  title: {
    fontSize: 24,
    color: COLORS.text,
  },
});
