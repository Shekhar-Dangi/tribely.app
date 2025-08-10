// OpenCage Geocoding API utilities
import { LocationData } from "@/types/location";

const OPENCAGE_API_KEY = process.env.EXPO_PUBLIC_OPENCAGE_API_KEY;
const OPENCAGE_BASE_URL = "https://api.opencagedata.com/geocode/v1/json";

export interface OpenCageResponse {
  results: {
    components: {
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      province?: string;
      country?: string;
      country_code?: string;
    };
    formatted: string;
    geometry: {
      lat: number;
      lng: number;
    };
  }[];
  status: {
    code: number;
    message: string;
  };
  total_results: number;
}

/**
 * Reverse geocode coordinates to get address using OpenCage API
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<LocationData | null> => {
  if (!OPENCAGE_API_KEY) {
    console.error("OpenCage API key not found");
    return null;
  }

  try {
    const url = `${OPENCAGE_BASE_URL}?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}&language=en&pretty=1`;

    console.log("OpenCage reverse geocoding:", { latitude, longitude });

    const response = await fetch(url);
    const data: OpenCageResponse = await response.json();

    if (data.status.code !== 200) {
      console.error("OpenCage API error:", data.status.message);
      return null;
    }

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const components = result.components;

      console.log("OpenCage result:", result);

      const locationData: LocationData = {
        city:
          components.city || components.town || components.village || undefined,
        state: components.state || components.province || undefined,
        country: components.country || undefined,
        coordinates: {
          latitude: result.geometry.lat,
          longitude: result.geometry.lng,
        },
      };

      return locationData;
    }

    return null;
  } catch (error) {
    console.error("OpenCage reverse geocoding error:", error);
    return null;
  }
};

/**
 * Forward geocode address to get coordinates using OpenCage API
 */
export const forwardGeocode = async (
  address: string
): Promise<LocationData | null> => {
  if (!OPENCAGE_API_KEY) {
    console.error("OpenCage API key not found");
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `${OPENCAGE_BASE_URL}?q=${encodedAddress}&key=${OPENCAGE_API_KEY}&language=en&pretty=1&limit=1`;

    console.log("OpenCage forward geocoding:", address);

    const response = await fetch(url);
    const data: OpenCageResponse = await response.json();

    if (data.status.code !== 200) {
      console.error("OpenCage API error:", data.status.message);
      return null;
    }

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const components = result.components;

      console.log("OpenCage forward result:", result);

      const locationData: LocationData = {
        city:
          components.city || components.town || components.village || undefined,
        state: components.state || components.province || undefined,
        country: components.country || undefined,
        coordinates: {
          latitude: result.geometry.lat,
          longitude: result.geometry.lng,
        },
      };

      return locationData;
    }

    return null;
  } catch (error) {
    console.error("OpenCage forward geocoding error:", error);
    return null;
  }
};

/**
 * Search for locations using OpenCage API
 */
export const searchLocations = async (
  query: string,
  limit: number = 5
): Promise<LocationData[]> => {
  if (!OPENCAGE_API_KEY || query.length < 3) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `${OPENCAGE_BASE_URL}?q=${encodedQuery}&key=${OPENCAGE_API_KEY}&language=en&limit=${limit}&no_annotations=1`;

    const response = await fetch(url);
    const data: OpenCageResponse = await response.json();

    if (data.status.code !== 200) {
      console.error("OpenCage search error:", data.status.message);
      return [];
    }

    return data.results.map((result) => {
      const components = result.components;

      return {
        city:
          components.city || components.town || components.village || undefined,
        state: components.state || components.province || undefined,
        country: components.country || undefined,
        coordinates: {
          latitude: result.geometry.lat,
          longitude: result.geometry.lng,
        },
      };
    });
  } catch (error) {
    console.error("OpenCage search error:", error);
    return [];
  }
};
