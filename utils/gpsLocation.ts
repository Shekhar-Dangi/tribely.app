// GPS and geocoding utilities for location picker

import * as Location from "expo-location";
import { LocationData, GPSLocationResult } from "@/types/location";
import { reverseGeocode } from "./openCageGeocoding";

/**
 * Request location permissions from the user
 */
export const requestLocationPermissions = async (): Promise<boolean> => {
  try {
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== "granted") {
      console.log("Location permission denied");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error requesting location permissions:", error);
    return false;
  }
};

/**
 * Get current GPS location and reverse geocode to address
 */
export const getCurrentLocation = async (): Promise<GPSLocationResult> => {
  try {
    // Check if permissions are granted
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      return {
        success: false,
        error: "Location permissions not granted",
      };
    }

    // Get current position
    console.log("Getting current location...");
    const locationResult = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 10000,
      distanceInterval: 100,
    });

    const { latitude, longitude } = locationResult.coords;
    console.log("GPS coordinates:", { latitude, longitude });

    // First try Expo's built-in reverse geocoding
    const addressResult = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (addressResult.length > 0) {
      const address = addressResult[0];
      console.log("Expo reverse geocoded address:", address);

      const locationData: LocationData = {
        city: address.city || address.subregion || undefined,
        state: address.region || undefined,
        country: address.country || undefined,
        coordinates: {
          latitude,
          longitude,
        },
      };

      return {
        success: true,
        location: locationData,
      };
    } else {
      // Fallback to OpenCage API for better international coverage
      console.log("Expo reverse geocoding failed, trying OpenCage...");

      const openCageResult = await reverseGeocode(latitude, longitude);

      if (openCageResult) {
        console.log("OpenCage reverse geocoded address:", openCageResult);
        return {
          success: true,
          location: openCageResult,
        };
      }

      // If both fail, still return coordinates
      console.log(
        "Both reverse geocoding methods failed, returning coordinates only"
      );
      return {
        success: true,
        location: {
          coordinates: {
            latitude,
            longitude,
          },
        },
      };
    }
  } catch (error) {
    console.error("Error getting current location:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Check if location services are enabled
 */
export const isLocationServicesEnabled = async (): Promise<boolean> => {
  try {
    return await Location.hasServicesEnabledAsync();
  } catch (error) {
    console.error("Error checking location services:", error);
    return false;
  }
};

/**
 * Format GPS coordinates for display
 */
export const formatCoordinates = (coordinates: {
  latitude: number;
  longitude: number;
}): string => {
  const lat = coordinates.latitude.toFixed(4);
  const lng = coordinates.longitude.toFixed(4);
  return `${lat}, ${lng}`;
};
