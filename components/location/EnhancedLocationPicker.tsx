import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { LocationData, LocationPickerProps } from "@/types/location";
import { formatLocation } from "@/utils/location";
import { searchLocations } from "@/utils/openCageGeocoding";
import GPSLocationButton from "./GPSLocationButton";

// Debounce hook for search optimization
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const EnhancedLocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = "Search for city, state, or country",
  disabled = false,
  showGPSOption = true,
  style,
}) => {
  const [inputText, setInputText] = useState("");
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(inputText, 500);

  // Update input text when value changes externally
  useEffect(() => {
    if (value) {
      const formatted = formatLocation(value);
      setInputText(formatted);
    } else {
      setInputText("");
    }
  }, [value]);

  // Search for locations using OpenCage API
  const searchForLocations = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);

    try {
      const results = await searchLocations(searchTerm, 8);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error("Location search error:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Search when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm && isFocused) {
      searchForLocations(debouncedSearchTerm);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearchTerm, isFocused, searchForLocations]);

  const handleInputChange = (text: string) => {
    setInputText(text);

    // If user clears the input, clear the location
    if (!text.trim()) {
      onChange({});
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
  };

  const handleSuggestionSelect = (suggestion: LocationData) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setInputText(formatLocation(suggestion));
  };

  const handleGPSLocation = (gpsLocation: LocationData) => {
    onChange(gpsLocation);
    setShowSuggestions(false);

    // Format the GPS location for display
    const formatted = formatLocation(gpsLocation);
    setInputText(formatted);
  };

  const handleClearLocation = () => {
    setInputText("");
    onChange({});
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (inputText.length >= 3) {
      searchForLocations(inputText);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow selection
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const formatSuggestionText = (location: LocationData): string => {
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
    return parts.join(", ");
  };

  return (
    <View style={[styles.container, style]}>
      {/* Input Field */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInput,
          disabled && styles.disabledInput,
        ]}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={isFocused ? COLORS.secondary : COLORS.darkGray}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={COLORS.darkGray}
          editable={!disabled}
          autoCorrect={false}
          autoCapitalize="words"
        />

        {isSearching && (
          <ActivityIndicator
            size="small"
            color={COLORS.secondary}
            style={styles.loadingIcon}
          />
        )}

        {inputText.length > 0 && !disabled && !isSearching && (
          <TouchableOpacity
            onPress={handleClearLocation}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.darkGray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions List */}
      {showSuggestions && suggestions.length > 0 && !disabled && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.suggestionItem,
                index === suggestions.length - 1 && styles.lastSuggestionItem,
              ]}
              onPress={() => handleSuggestionSelect(suggestion)}
              activeOpacity={0.7}
            >
              <View style={styles.suggestionContent}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={COLORS.secondary}
                  style={styles.suggestionIcon}
                />
                <Text style={styles.suggestionText}>
                  {formatSuggestionText(suggestion)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* GPS Location Button */}
      {showGPSOption && !disabled && (
        <View style={styles.gpsContainer}>
          <GPSLocationButton
            onLocationReceived={handleGPSLocation}
            style={styles.gpsButton}
          />
        </View>
      )}

      {/* Location Display (when GPS is used) */}
      {value?.coordinates && (
        <View style={styles.coordinatesContainer}>
          <Ionicons name="navigate" size={16} color={COLORS.secondary} />
          <Text style={styles.coordinatesText}>
            📍 GPS Location ({value.coordinates.latitude.toFixed(4)},{" "}
            {value.coordinates.longitude.toFixed(4)})
          </Text>
        </View>
      )}

      {/* No results message */}
      {showSuggestions &&
        suggestions.length === 0 &&
        inputText.length >= 3 &&
        !isSearching && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              No locations found for &quot;{inputText}&quot;
            </Text>
          </View>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
  },
  focusedInput: {
    borderColor: COLORS.secondary,
    borderWidth: 2,
  },
  disabledInput: {
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.lightGray,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 0,
  },
  loadingIcon: {
    marginLeft: 8,
  },
  clearButton: {
    marginLeft: 8,
  },
  suggestionsContainer: {
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
    maxHeight: 300,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  lastSuggestionItem: {
    borderBottomWidth: 0,
  },
  suggestionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  gpsContainer: {
    marginTop: 12,
  },
  gpsButton: {
    alignSelf: "flex-start",
  },
  coordinatesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginLeft: 6,
    fontStyle: "italic",
  },
  noResultsContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  noResultsText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default EnhancedLocationPicker;
