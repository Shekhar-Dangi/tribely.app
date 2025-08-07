import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

interface UserTypeCardProps {
  type: "individual" | "gym" | "brand";
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  onSelect: () => void;
}

const UserTypeCard: React.FC<UserTypeCardProps> = ({
  title,
  description,
  icon,
  gradient,
  onSelect,
}) => {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onSelect}>
      <LinearGradient colors={gradient} style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={32} color="white" />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
        <View style={styles.selectButton}>
          <Text style={styles.selectButtonText}>Select</Text>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function UserTypeSelection() {
  const handleUserTypeSelect = (userType: "individual" | "gym" | "brand") => {
    // Store the selected user type in the onboarding context or AsyncStorage
    // For now, we'll navigate directly to the basic profile screen
    router.replace({
      pathname: "/(onboard)/basic-profile" as any,
      params: { userType },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Join Tribely</Text>
        <Text style={styles.subtitle}>
          Choose your account type to get started with a personalized experience
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        <UserTypeCard
          type="individual"
          title="Individual"
          description="Personal fitness journey, track PRs, connect with trainers and gyms"
          icon="person"
          gradient={[COLORS.primary, COLORS.secondary]}
          onSelect={() => handleUserTypeSelect("individual")}
        />

        <UserTypeCard
          type="gym"
          title="Gym"
          description="Showcase your facility, attract members, manage your fitness community"
          icon="fitness"
          gradient={["#FF6B6B", "#FF8E53"]}
          onSelect={() => handleUserTypeSelect("gym")}
        />

        <UserTypeCard
          type="brand"
          title="Brand"
          description="Connect with fitness enthusiasts, run campaigns, build partnerships"
          icon="business"
          gradient={["#4ECDC4", "#44A08D"]}
          onSelect={() => handleUserTypeSelect("brand")}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don&apos;t worry, you can always change this later in your settings
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },
  cardContainer: {
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    minHeight: 140,
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
    marginBottom: 16,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  selectButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    paddingVertical: 30,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
