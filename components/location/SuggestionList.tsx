import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { LocationSuggestion } from "@/types/location";
import { formatSuggestion } from "@/utils/locationSuggestions";

interface SuggestionListProps {
  suggestions: LocationSuggestion[];
  onSelect: (suggestion: LocationSuggestion) => void;
  visible: boolean;
  maxHeight?: number;
}

const SuggestionList: React.FC<SuggestionListProps> = ({
  suggestions,
  onSelect,
  visible,
  maxHeight = 200,
}) => {
  if (!visible || suggestions.length === 0) {
    return null;
  }

  const getIconForType = (type: LocationSuggestion["type"]) => {
    switch (type) {
      case "country":
        return "globe-outline";
      case "state":
        return "map-outline";
      case "city":
        return "location-outline";
      default:
        return "location-outline";
    }
  };

  return (
    <View style={[styles.container, { maxHeight }]}>
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={`${suggestion.type}-${suggestion.name}-${index}`}
            style={[
              styles.suggestionItem,
              index === suggestions.length - 1 && styles.lastItem,
            ]}
            onPress={() => onSelect(suggestion)}
            activeOpacity={0.7}
          >
            <View style={styles.suggestionContent}>
              <Ionicons
                name={getIconForType(suggestion.type) as any}
                size={18}
                color={COLORS.secondary}
                style={styles.icon}
              />
              <View style={styles.textContainer}>
                <Text style={styles.suggestionText}>
                  {formatSuggestion(suggestion)}
                </Text>
                <Text style={styles.typeText}>
                  {suggestion.type.charAt(0).toUpperCase() +
                    suggestion.type.slice(1)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginTop: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  suggestionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  typeText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
});

export default SuggestionList;
