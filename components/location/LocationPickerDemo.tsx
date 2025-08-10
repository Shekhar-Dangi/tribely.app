import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";
import {
  LocationPicker,
  EnhancedLocationPicker,
  LocationData,
} from "@/components/location";
import { formatLocation } from "@/utils/location";

const LocationPickerDemo: React.FC = () => {
  const [location1, setLocation1] = useState<LocationData>({});
  const [location2, setLocation2] = useState<LocationData>({
    city: "New York City",
    state: "New York",
    country: "United States",
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Location Picker Demo</Text>
        {/* Demo 1: Enhanced Location Picker with OpenCage API */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            1. Enhanced Location Picker (OpenCage API)
          </Text>
          <Text style={styles.description}>
            Start typing any city worldwide to see real location suggestions
          </Text>

          <EnhancedLocationPicker
            value={location1}
            onChange={setLocation1}
            placeholder="Search for any location worldwide"
            showGPSOption={true}
          />

          {location1 && Object.keys(location1).length > 0 && (
            <View style={styles.result}>
              <Text style={styles.resultTitle}>Selected Location:</Text>
              <Text style={styles.resultText}>
                Formatted: {formatLocation(location1)}
              </Text>
              <Text style={styles.resultDetails}>
                Raw Data: {JSON.stringify(location1, null, 2)}
              </Text>
            </View>
          )}
        </View>
        {/* Demo 2: Original Location Picker (Static Data) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            2. Original Location Picker (Static Data)
          </Text>
          <Text style={styles.description}>
            Uses static US data - compare with enhanced version above
          </Text>

          <LocationPicker
            value={location2}
            onChange={setLocation2}
            placeholder="Search US locations"
            showGPSOption={true}
          />

          <View style={styles.result}>
            <Text style={styles.resultTitle}>Selected Location:</Text>
            <Text style={styles.resultText}>
              Formatted: {formatLocation(location2)}
            </Text>
            <Text style={styles.resultDetails}>
              Raw Data: {JSON.stringify(location2, null, 2)}
            </Text>
          </View>
        </View>
        {/* Demo 3: Enhanced Location Picker without GPS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Search Only (No GPS)</Text>
          <Text style={styles.description}>
            Enhanced picker with search but without GPS option
          </Text>

          <EnhancedLocationPicker
            value={{}}
            onChange={(loc) => console.log("Location changed:", loc)}
            placeholder="Type to search worldwide locations"
            showGPSOption={false}
          />
        </View>{" "}
        {/* Demo 2: Pre-filled Location Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Pre-filled Location Picker</Text>
          <Text style={styles.description}>
            This one starts with New York City pre-filled
          </Text>

          <LocationPicker
            value={location2}
            onChange={setLocation2}
            placeholder="Enter your location"
            showGPSOption={true}
          />

          <View style={styles.result}>
            <Text style={styles.resultTitle}>Selected Location:</Text>
            <Text style={styles.resultText}>
              Formatted: {formatLocation(location2)}
            </Text>
            <Text style={styles.resultDetails}>
              Raw Data: {JSON.stringify(location2, null, 2)}
            </Text>
          </View>
        </View>
        {/* Demo 3: Location Picker without GPS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Manual Entry Only</Text>
          <Text style={styles.description}>
            This one doesn&apos;t show the GPS option
          </Text>

          <LocationPicker
            value={{}}
            onChange={(loc) => console.log("Location changed:", loc)}
            placeholder="Type to search locations"
            showGPSOption={false}
          />
        </View>
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How to use:</Text>
          <Text style={styles.instructionText}>
            • Type any city, state, or country name worldwide{"\n"}• Wait for
            real-time suggestions from OpenCage API{"\n"}• Select from
            suggestions or continue typing{"\n"}• Use &quot;Use My
            Location&quot; for GPS location{"\n"}• Clear with the X button{"\n"}
            • Try locations like &quot;Paris&quot;, &quot;Tokyo&quot;,
            &quot;Mumbai&quot;
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 16,
    lineHeight: 20,
  },
  result: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: "500",
    marginBottom: 8,
  },
  resultDetails: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontFamily: "monospace",
    backgroundColor: COLORS.lightGray,
    padding: 8,
    borderRadius: 4,
  },
  instructions: {
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.secondary + "10",
    borderRadius: 8,
    marginBottom: 40,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.secondary,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
});

export default LocationPickerDemo;
