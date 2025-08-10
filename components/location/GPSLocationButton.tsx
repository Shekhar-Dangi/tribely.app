import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import {
  getCurrentLocation,
  isLocationServicesEnabled,
} from "@/utils/gpsLocation";
import { LocationData } from "@/types/location";

interface GPSLocationButtonProps {
  onLocationReceived: (location: LocationData) => void;
  disabled?: boolean;
  style?: any;
}

const GPSLocationButton: React.FC<GPSLocationButtonProps> = ({
  onLocationReceived,
  disabled = false,
  style,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetLocation = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);

    try {
      // First check if location services are enabled
      const servicesEnabled = await isLocationServicesEnabled();
      if (!servicesEnabled) {
        Alert.alert(
          "Location Services Disabled",
          "Please enable location services in your device settings to use this feature.",
          [{ text: "OK" }]
        );
        return;
      }

      // Get current location
      const result = await getCurrentLocation();

      if (result.success && result.location) {
        onLocationReceived(result.location);
      } else {
        Alert.alert(
          "Location Error",
          result.error ||
            "Could not get your location. Please try again or enter manually.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error in handleGetLocation:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabledButton, style]}
      onPress={handleGetLocation}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={COLORS.white} />
      ) : (
        <Ionicons name="location" size={18} color={COLORS.white} />
      )}
      <Text style={[styles.buttonText, disabled && styles.disabledText]}>
        {isLoading ? "Getting Location..." : "Use My Location"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  disabledText: {
    color: COLORS.darkGray,
  },
});

export default GPSLocationButton;
