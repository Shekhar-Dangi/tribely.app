import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { LocationData, LocationPickerProps } from "@/types/location";
import {
  getAllSuggestions,
  parseLocationString,
} from "@/utils/locationSuggestions";
import { formatLocation } from "@/utils/location";
import SuggestionList from "./SuggestionList";
import GPSLocationButton from "./GPSLocationButton";

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = "Enter city, state, or country",
  disabled = false,
  showGPSOption = true,
  style,
}) => {
  const [inputText, setInputText] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Update input text when value changes externally
  useEffect(() => {
    if (value) {
      const formatted = formatLocation(value);
      setInputText(formatted);
    } else {
      setInputText("");
    }
  }, [value]);

  // Update suggestions when input text changes
  useEffect(() => {
    if (inputText.length >= 2) {
      const currentSuggestions = getAllSuggestions(
        inputText,
        value?.country,
        value?.state
      );
      setSuggestions(currentSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputText, value?.country, value?.state]);

  const handleInputChange = (text: string) => {
    setInputText(text);

    // If user clears the input, clear the location
    if (!text.trim()) {
      onChange({});
      return;
    }

    // Parse the input text to extract location components
    const parsed = parseLocationString(text);

    // Only update if we have valid components
    if (parsed.city || parsed.state || parsed.country) {
      onChange({
        ...value,
        ...parsed,
        // Clear coordinates when manually typing
        coordinates: undefined,
      });
    }
  };

  const handleSuggestionSelect = (suggestion: any) => {
    const newLocation: LocationData = { ...value };

    // Update location based on suggestion type
    switch (suggestion.type) {
      case "country":
        newLocation.country = suggestion.name;
        // Clear state and city when country changes
        newLocation.state = undefined;
        newLocation.city = undefined;
        break;
      case "state":
        newLocation.state = suggestion.name;
        if (suggestion.parentName) {
          newLocation.country = suggestion.parentName;
        }
        // Clear city when state changes
        newLocation.city = undefined;
        break;
      case "city":
        newLocation.city = suggestion.name;
        if (suggestion.parentName) {
          // Determine if parent is state or country
          if (newLocation.country === "United States" || !newLocation.country) {
            newLocation.state = suggestion.parentName;
          }
        }
        break;
    }

    // Clear coordinates when selecting from suggestions
    newLocation.coordinates = undefined;

    onChange(newLocation);
    setShowSuggestions(false);
    setInputText(formatLocation(newLocation));
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
    if (inputText.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow selection
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
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
          name="location-outline"
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
        {inputText.length > 0 && !disabled && (
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
      <SuggestionList
        suggestions={suggestions}
        onSelect={handleSuggestionSelect}
        visible={showSuggestions && !disabled}
      />

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
            Location from GPS ({value.coordinates.latitude.toFixed(4)},{" "}
            {value.coordinates.longitude.toFixed(4)})
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
  clearButton: {
    marginLeft: 8,
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
});

export default LocationPicker;
