// Location suggestion and search utilities

import {
  COUNTRIES,
  getCitiesForLocation,
  getStatesForCountry,
} from "@/constants/locationData";
import { LocationSuggestion } from "@/types/location";

/**
 * Filter suggestions based on search term
 */
export const filterSuggestions = (
  items: string[],
  searchTerm: string,
  type: "country" | "state" | "city",
  parentName?: string
): LocationSuggestion[] => {
  if (!searchTerm) return [];

  const filtered = items.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return filtered.slice(0, 8).map((item) => ({
    name: item,
    type,
    parentName,
  }));
};

/**
 * Get country suggestions based on search term
 */
export const getCountrySuggestions = (
  searchTerm: string
): LocationSuggestion[] => {
  return filterSuggestions(COUNTRIES, searchTerm, "country");
};

/**
 * Get state suggestions based on search term and country
 */
export const getStateSuggestions = (
  searchTerm: string,
  country?: string
): LocationSuggestion[] => {
  const states = getStatesForCountry(country);
  return filterSuggestions(states, searchTerm, "state", country);
};

/**
 * Get city suggestions based on search term, country, and state
 */
export const getCitySuggestions = (
  searchTerm: string,
  country?: string,
  state?: string
): LocationSuggestion[] => {
  const cities = getCitiesForLocation(country, state);
  return filterSuggestions(cities, searchTerm, "city", state || country);
};

/**
 * Get all suggestions for a search term (across all types)
 */
export const getAllSuggestions = (
  searchTerm: string,
  country?: string,
  state?: string
): LocationSuggestion[] => {
  if (!searchTerm || searchTerm.length < 2) return [];

  const suggestions: LocationSuggestion[] = [];

  // Country suggestions (if no country selected)
  if (!country) {
    suggestions.push(...getCountrySuggestions(searchTerm));
  }

  // State suggestions (if country selected but no state)
  if (country && !state) {
    suggestions.push(...getStateSuggestions(searchTerm, country));
  }

  // City suggestions (if country and optionally state selected)
  if (country) {
    suggestions.push(...getCitySuggestions(searchTerm, country, state));
  }

  return suggestions.slice(0, 10);
};

/**
 * Format suggestion for display
 */
export const formatSuggestion = (suggestion: LocationSuggestion): string => {
  switch (suggestion.type) {
    case "country":
      return suggestion.name;
    case "state":
      return suggestion.parentName
        ? `${suggestion.name}, ${suggestion.parentName}`
        : suggestion.name;
    case "city":
      return suggestion.parentName
        ? `${suggestion.name}, ${suggestion.parentName}`
        : suggestion.name;
    default:
      return suggestion.name;
  }
};

/**
 * Parse a location string into components
 * Example: "Los Angeles, California, United States" -> {city, state, country}
 */
export const parseLocationString = (
  locationString: string
): {
  city?: string;
  state?: string;
  country?: string;
} => {
  const parts = locationString.split(",").map((part) => part.trim());

  if (parts.length === 1) {
    return { city: parts[0] };
  } else if (parts.length === 2) {
    return { city: parts[0], state: parts[1] };
  } else if (parts.length >= 3) {
    return {
      city: parts[0],
      state: parts[1],
      country: parts[2],
    };
  }

  return {};
};
