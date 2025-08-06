import { COLORS, FONTS, SPACING, SHADOWS } from "../constants/theme";
import { Link } from "expo-router";
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { height } = Dimensions.get("window");

export default function LandingScreen() {
  return (
    <ImageBackground
      source={require("../assets/images/onboard.jpg")}
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={[
          "rgba(26, 26, 26, 0.2)",
          "rgba(26, 26, 26, 0.6)",
          "rgba(26, 26, 26, 0.9)",
        ]}
        style={styles.gradientOverlay}
      />
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.appName}>TRIBELY</Text>
          <Text style={styles.tagline}>LinkedIn for Gym Bros</Text>
        </View>

        <View style={styles.bottomContainer}>
          <Text style={styles.welcomeText}>
            Connect with gym enthusiasts, share workouts, and grow your fitness
            network
          </Text>

          <Link href="/sign-in" asChild>
            <TouchableOpacity
              style={styles.getStartedButton}
              activeOpacity={0.8}
            >
              <Text style={styles.getStartedButtonText}>Gett Started</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: height * 0.15,
    paddingBottom: height * 0.08,
  },
  headerContainer: {
    alignItems: "center",
  },
  appName: {
    fontSize: FONTS.sizes.xxl,
    ...FONTS.bold,
    color: COLORS.white,
    letterSpacing: 3,
  },
  tagline: {
    fontSize: FONTS.sizes.md,
    color: COLORS.mediumGray,
    marginTop: SPACING.sm,
  },
  bottomContainer: {
    alignItems: "center",
  },
  welcomeText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.white,
    textAlign: "center",
    lineHeight: 28,
    marginBottom: SPACING.xl,
    maxWidth: 320,
  },
  getStartedButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    ...SHADOWS.small,
  },
  getStartedButtonText: {
    fontSize: FONTS.sizes.md,
    ...FONTS.bold,
    color: COLORS.primary,
  },
});
