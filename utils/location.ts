// Location utilities for the Tribely app

export interface Location {
  city?: string;
  state?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Format location for display
 */
export const formatLocation = (location?: Location): string => {
  if (!location) return "";

  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.country && location.country !== "United States") {
    parts.push(location.country);
  }

  return parts.join(", ");
};

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in miles
 */
export const calculateDistance = (
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Check if two locations are in the same city
 */
export const isSameCity = (
  location1?: Location,
  location2?: Location
): boolean => {
  if (!location1 || !location2) return false;
  return (
    location1.city?.toLowerCase() === location2.city?.toLowerCase() &&
    location1.state?.toLowerCase() === location2.state?.toLowerCase()
  );
};

/**
 * Check if two locations are in the same state
 */
export const isSameState = (
  location1?: Location,
  location2?: Location
): boolean => {
  if (!location1 || !location2) return false;
  return location1.state?.toLowerCase() === location2.state?.toLowerCase();
};

/**
 * Get location from address string (basic parsing)
 * This is a simple implementation - in production you'd use a geocoding service
 */
export const parseLocationFromAddress = (
  address: string
): Partial<Location> => {
  const parts = address.split(",").map((part) => part.trim());

  if (parts.length >= 2) {
    return {
      city: parts[0],
      state: parts[1],
    };
  }

  return {};
};

/**
 * Validate location coordinates
 */
export const isValidCoordinates = (coordinates?: {
  latitude: number;
  longitude: number;
}): boolean => {
  if (!coordinates) return false;

  const { latitude, longitude } = coordinates;
  return (
    latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
  );
};

/**
 * Get user's location display priority
 * Returns the best available location info for display
 */
export const getBestLocationDisplay = (
  userLocation?: Location,
  businessAddress?: string
): string => {
  // Priority: User location > Business address > Empty
  if (userLocation && (userLocation.city || userLocation.state)) {
    return formatLocation(userLocation);
  }

  if (businessAddress) {
    const parsed = parseLocationFromAddress(businessAddress);
    return formatLocation(parsed);
  }

  return "";
};

/**
 * Common US states for location picker
 */
export const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];
