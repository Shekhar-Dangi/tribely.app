// Static location data for suggestions and autocomplete

export const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "India",
  "Japan",
  "South Korea",
  "Brazil",
  "Mexico",
  "Argentina",
];

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

// Major cities by state (subset for demo - can be expanded)
export const US_CITIES: Record<string, string[]> = {
  California: [
    "Los Angeles",
    "San Francisco",
    "San Diego",
    "Sacramento",
    "San Jose",
    "Oakland",
    "Fresno",
    "Long Beach",
    "Santa Ana",
    "Anaheim",
  ],
  "New York": [
    "New York City",
    "Buffalo",
    "Rochester",
    "Syracuse",
    "Albany",
    "Yonkers",
    "Utica",
    "White Plains",
    "Troy",
    "Schenectady",
  ],
  Texas: [
    "Houston",
    "Dallas",
    "Austin",
    "San Antonio",
    "Fort Worth",
    "El Paso",
    "Arlington",
    "Corpus Christi",
    "Plano",
    "Laredo",
  ],
  Florida: [
    "Miami",
    "Tampa",
    "Orlando",
    "Jacksonville",
    "St. Petersburg",
    "Hialeah",
    "Tallahassee",
    "Fort Lauderdale",
    "Port St. Lucie",
    "Cape Coral",
  ],
  Illinois: [
    "Chicago",
    "Aurora",
    "Peoria",
    "Rockford",
    "Joliet",
    "Naperville",
    "Springfield",
    "Elgin",
    "Waukegan",
    "Cicero",
  ],
  // Add more states as needed
};

// International cities by country (subset for demo)
export const INTERNATIONAL_CITIES: Record<string, string[]> = {
  Canada: [
    "Toronto",
    "Vancouver",
    "Montreal",
    "Calgary",
    "Ottawa",
    "Edmonton",
    "Mississauga",
    "Winnipeg",
    "Quebec City",
    "Hamilton",
  ],
  "United Kingdom": [
    "London",
    "Manchester",
    "Birmingham",
    "Glasgow",
    "Liverpool",
    "Edinburgh",
    "Bristol",
    "Cardiff",
    "Sheffield",
    "Leeds",
  ],
  Australia: [
    "Sydney",
    "Melbourne",
    "Brisbane",
    "Perth",
    "Adelaide",
    "Gold Coast",
    "Canberra",
    "Newcastle",
    "Wollongong",
    "Logan City",
  ],
  // Add more countries as needed
};

// Helper function to get cities for a country/state
export const getCitiesForLocation = (
  country?: string,
  state?: string
): string[] => {
  if (country === "United States" && state && US_CITIES[state]) {
    return US_CITIES[state];
  }

  if (country && INTERNATIONAL_CITIES[country]) {
    return INTERNATIONAL_CITIES[country];
  }

  return [];
};

// Helper function to get states for a country
export const getStatesForCountry = (country?: string): string[] => {
  if (country === "United States") {
    return US_STATES;
  }

  // For other countries, you might have provinces/states
  // For now, return empty array for international
  return [];
};
