// Location types and interfaces for location picker components

export interface LocationData {
  city?: string;
  state?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface LocationSuggestion {
  name: string;
  type: "country" | "state" | "city";
  parentName?: string; // For states (country) and cities (state)
}

export interface LocationPickerProps {
  value?: LocationData;
  onChange: (location: LocationData) => void;
  placeholder?: string;
  disabled?: boolean;
  showGPSOption?: boolean;
  style?: any;
}

export interface GPSLocationResult {
  success: boolean;
  location?: LocationData;
  error?: string;
}

// Location input modes
export type LocationInputMode = "manual" | "gps" | "suggestions";
