import { useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect } from "react";
import { Pressable, View, StyleSheet, Image, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function Page() {
  useWarmUpBrowser();

  const { startSSOFlow } = useSSO();

  const onPress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: "tribely",
          path: "(tabs)",
        }),
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      } else {
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  }, [startSSOFlow]);

  return (
    <LinearGradient colors={["#E3E3E3", "#ffffff"]} start={[0, 0]} end={[1, 1]} style={{flex: 1}}>
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome to Tribely</Text>
            <Text style={styles.subtitle}>
              Show your stats, train with people.
            </Text>
           
          </View>
        </View>

        {/* Sign In Section */}
        <View style={styles.signInSection}>


          <Pressable style={styles.googleButton} onPress={onPress}>
            <View style={styles.buttonContent}>
            <Ionicons name="logo-google" style={{color: COLORS.primary, marginHorizontal: SPACING.md, fontSize: FONTS.sizes.md}} />
              <Text style={styles.buttonText}>Continue with Google</Text>
            </View>
          </Pressable>

          <Text style={styles.termsText}>
            By continuing, you agree to our <Text style={{color: COLORS.primary, textDecorationLine: "underline"}}>Terms of Service </Text>and <Text style={{color: COLORS.primary, textDecorationLine: "underline" }}>Privacy Policy</Text><Text>.</Text>
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Join thousands of fitness enthusiasts already on Tribely
        </Text>
      </View>
    </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: "space-between",
  },

  // Header Section
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: SPACING.xxl,
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: SPACING.lg,
  },
  titleContainer: {
    alignItems: "center",
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    ...FONTS.bold,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    ...FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },

  // Sign In Section
  signInSection: {
    paddingBottom: SPACING.md,
    borderBottomColor: COLORS.darkGray,
    borderBottomWidth: 1
  },
  signInTitle: {
    fontSize: FONTS.sizes.lg,
    ...FONTS.bold,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  googleButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  buttonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignContent: "center"
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: SPACING.md,
  },
  buttonText: {
    fontSize: FONTS.sizes.md,
    ...FONTS.medium,
    color: COLORS.text,
  },
  termsText: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.regular,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md
  },

  // Footer Section
  footer: {
    paddingVertical: SPACING.xl,

    paddingHorizontal: SPACING.md,
  },
  footerText: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.medium,
    color: COLORS.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
