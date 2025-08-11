import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import * as Location from "expo-location";

interface LocationData {
  city: string;
  state: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface LocationSuggestion {
  formatted: string;
  components: {
    city?: string;
    state?: string;
    country?: string;
  };
  geometry: {
    lat: number;
    lng: number;
  };
}

interface LocationSelectorProps {
  value: LocationData;
  onChange: (location: LocationData) => void;
  placeholder?: string;
}

export default function LocationSelector({
  value,
  onChange,
  placeholder = "Search for a location...",
}: LocationSelectorProps) {
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSettingFromSelection, setIsSettingFromSelection] = useState(false);
  const debounceTimeoutRef = useRef<number | null>(null);

  // Initialize search query from current location value
  useEffect(() => {
    if (value.city || value.state || value.country) {
      const locationString = [value.city, value.state, value.country]
        .filter(Boolean)
        .join(", ");
      setSearchQuery(locationString);
    } else {
      // Clear search query if location is empty
      setSearchQuery("");
    }
  }, [value.city, value.state, value.country]);

  // Request location permissions and get current location
  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      console.log("LocationSelector: Requesting location permissions...");

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log(status);
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to get your current location.",
          [{ text: "OK" }]
        );
        return;
      }

      console.log("LocationSelector: Getting current position...");

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });

      console.log("LocationSelector: Current position obtained:", {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      console.log("LocationSelector: Reverse geocode result:", address);

      const locationData: LocationData = {
        city: address.city || "",
        state: address.region || "",
        country: address.country || "",
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      };

      // Update search query display
      const locationString = [
        locationData.city,
        locationData.state,
        locationData.country,
      ]
        .filter(Boolean)
        .join(", ");
      setSearchQuery(locationString);

      // Update form value
      onChange(locationData);
      setIsUsingCurrentLocation(true);
      setShowSuggestions(false);

      console.log(
        "LocationSelector: Location updated successfully:",
        locationData
      );
    } catch (error) {
      console.error("LocationSelector: Error getting current location:", error);
      Alert.alert(
        "Location Error",
        "Unable to get your current location. Please try again or enter manually.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Search locations using OpenCage API
  const searchLocations = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoadingSuggestions(true);
      console.log("LocationSelector: Searching for locations:", query);

      const API_KEY = process.env.EXPO_PUBLIC_OPENCAGE_API_KEY;
      if (!API_KEY) {
        console.error("LocationSelector: OpenCage API key not found");
        return;
      }

      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${API_KEY}&limit=5&no_annotations=1&language=en`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log(
        "LocationSelector: Search results received:",
        data.results?.length || 0,
        "results"
      );

      const formattedSuggestions: LocationSuggestion[] =
        data.results?.map((result: any) => ({
          formatted: result.formatted,
          components: {
            city:
              result.components.city ||
              result.components.town ||
              result.components.village ||
              "",
            state: result.components.state || result.components.province || "",
            country: result.components.country || "",
          },
          geometry: {
            lat: result.geometry.lat,
            lng: result.geometry.lng,
          },
        })) || [];

      setSuggestions(formattedSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error("LocationSelector: Error searching locations:", error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounced search function
  const debouncedSearch = (query: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      searchLocations(query);
    }, 300);
  };

  // Handle search input change
  const handleSearchChange = (text: string) => {
    // Don't process if we're setting from a selection
    if (isSettingFromSelection) {
      setIsSettingFromSelection(false);
      return;
    }

    // Update only the local query for suggestions; do not update form value.
    setSearchQuery(text);
    setIsUsingCurrentLocation(false);

    // Selection is required to commit a value; typing only fetches suggestions
    debouncedSearch(text);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    console.log("LocationSelector: Suggestion selected:", suggestion);

    const locationData: LocationData = {
      city: suggestion.components.city || "",
      state: suggestion.components.state || "",
      country: suggestion.components.country || "",
      coordinates: {
        latitude: suggestion.geometry.lat,
        longitude: suggestion.geometry.lng,
      },
    };

    // Display in city, state, country format instead of full formatted string
    const displayString = [
      locationData.city,
      locationData.state,
      locationData.country,
    ]
      .filter(Boolean)
      .join(", ");

    console.log("LocationSelector: Setting display string to:", displayString);

    // Set flag to prevent handleSearchChange from firing
    setIsSettingFromSelection(true);

    // Force update the search query immediately
    setSearchQuery(displayString);
    setIsUsingCurrentLocation(false);
    setShowSuggestions(false);
    setSuggestions([]);

    // Call onChange after state updates
    onChange(locationData);
    Keyboard.dismiss();

    console.log("LocationSelector: Location selected:", locationData);
  };

  // Handle manual input (when user types without selecting suggestion)
  const handleInputBlur = () => {
    // Do not commit manual input on blur; require explicit selection or current location
    setShowSuggestions(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Location</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={searchQuery}
          onChangeText={handleSearchChange}
          onBlur={handleInputBlur}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          placeholderTextColor="#999"
        />

        {isLoadingSuggestions && (
          <ActivityIndicator
            size="small"
            color="#007AFF"
            style={styles.searchLoader}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={getCurrentLocation}
        disabled={isLoadingLocation}
      >
        {isLoadingLocation ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <Text style={styles.currentLocationText}>
            📍 Use Current Location
          </Text>
        )}
      </TouchableOpacity>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionsList}>
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={`${item.formatted}-${index}`}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(item)}
              >
                <Text style={styles.suggestionText}>{item.formatted}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {isUsingCurrentLocation && (
        <Text style={styles.currentLocationIndicator}>
          ✅ Using current location
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: "relative",
    zIndex: 1000,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 48,
  },
  searchLoader: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f8ff",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    minHeight: 48,
  },
  currentLocationText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    zIndex: 1001,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: 14,
    color: "#333",
  },
  currentLocationIndicator: {
    fontSize: 14,
    color: "#28a745",
    marginTop: 8,
    textAlign: "center",
  },
});
