import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text } from "@/components/ui/Text";
import { authService } from "@/features/auth/authService";
import { useAuthStore } from "@/store";
import { colors, spacing, radius, rnShadows } from "@team-flow/shared";

// Google brand color — required by Google's branding guidelines
const GOOGLE_BUTTON_BG = "#F2F2F2";
const GOOGLE_ICON_COLOR = "#4285F4";

export default function LoginScreen() {
  const { setSession } = useAuthStore();
  const [email, setEmail] = useState(__DEV__ ? "dev@teamflow.local" : "");
  const [password, setPassword] = useState(__DEV__ ? "devpass123" : "");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [devLoading, setDevLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const anyLoading = googleLoading || appleLoading || devLoading;

  async function handleGoogleSignIn() {
    if (anyLoading) return;
    setGoogleLoading(true);
    setError(null);
    try {
      const success = await authService.signInWithGoogle();
      if (success) {
        await hydrateSession();
      } else {
        setError("Sign in was cancelled. Please try again.");
      }
    } catch {
      setError("Sign in failed. Check your internet connection.");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleAppleSignIn() {
    if (anyLoading) return;
    setAppleLoading(true);
    setError(null);
    try {
      const success = await authService.signInWithApple();
      if (success) {
        await hydrateSession();
      } else {
        setError("Apple sign in was cancelled.");
      }
    } catch {
      setError("Apple sign in failed. Please try again.");
    } finally {
      setAppleLoading(false);
    }
  }

  async function handleDevSignIn() {
    if (anyLoading) return;
    setDevLoading(true);
    setError(null);
    try {
      const success = await authService.signInWithCredentials(email, password);
      if (success) {
        await hydrateSession();
      } else {
        setError("Invalid credentials. Is the dev server running?");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(
        msg.includes("abort")
          ? "Request timed out. Is the dev server running on port 3000?"
          : "Sign in failed. Check the server."
      );
    } finally {
      setDevLoading(false);
    }
  }

  async function hydrateSession() {
    const session = await authService.getSession();
    if (session) {
      setSession(session);
      router.replace(
        session.companyId ? "/(app)/dashboard" : "/(auth)/onboarding"
      );
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Main card */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <Text style={styles.logoText}>TS</Text>
            </View>
            <View style={styles.headingGroup}>
              <Text style={styles.heading}>Welcome back</Text>
              <Text style={styles.subtitle}>
                Sign in to your Team Space workspace.
              </Text>
            </View>
          </View>

          {/* Auth buttons */}
          <View style={styles.buttons}>
            {/* Google */}
            <Pressable
              style={[styles.googleButton, anyLoading && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={anyLoading}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color={colors.text.muted} />
              ) : (
                <AntDesign name="google" size={18} color={GOOGLE_ICON_COLOR} />
              )}
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </Pressable>

            {/* Apple — native button, iOS only */}
            {Platform.OS === "ios" && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={
                  AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                }
                buttonStyle={
                  AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                cornerRadius={radius.r32}
                style={[
                  styles.appleButton,
                  anyLoading && styles.buttonDisabled,
                ]}
                onPress={handleAppleSignIn}
              />
            )}
          </View>

          {/* Request access */}
          <Text style={styles.requestAccess}>
            {"Don't have an account? "}
            <Text style={styles.requestLink}>Request access</Text>
          </Text>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service
        </Text>

        {/* Error */}
        {error && <Text style={styles.error}>{error}</Text>}

        {/* DEV credentials section */}
        {__DEV__ && (
          <View style={styles.devSection}>
            <Text style={styles.devLabel}>DEV ONLY — Credentials login</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={colors.text.muted}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={colors.text.muted}
            />
            <Pressable
              style={[styles.devButton, anyLoading && styles.buttonDisabled]}
              onPress={handleDevSignIn}
              disabled={anyLoading}
            >
              {devLoading ? (
                <ActivityIndicator size="small" color={colors.text.onAccent} />
              ) : (
                <Text style={styles.devButtonText}>Sign in (dev)</Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.s24,
    paddingVertical: spacing.s40,
    gap: spacing.s16,
  },

  /* Card */
  card: {
    backgroundColor: colors.surface.level1,
    borderRadius: radius.r32,
    borderWidth: 1,
    borderColor: "rgba(241,245,249,0.5)",
    padding: spacing.s40,
    gap: spacing.s40,
    ...rnShadows.e2,
  },

  /* Header */
  header: {
    alignItems: "center",
    gap: spacing.s24,
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: radius.r16,
    backgroundColor: colors.text.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.onAccent,
    letterSpacing: -0.4,
  },
  headingGroup: {
    alignItems: "center",
    gap: spacing.s8,
    width: "100%",
  },
  heading: {
    fontSize: 24,
    fontWeight: "500",
    color: colors.text.primary,
    letterSpacing: -0.6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.text.muted,
    textAlign: "center",
    lineHeight: 24,
  },

  /* Buttons */
  buttons: {
    gap: spacing.s20,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.s8,
    height: 50,
    borderRadius: radius.full,
    backgroundColor: GOOGLE_BUTTON_BG,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  appleButton: {
    width: "100%",
    height: 50,
  },
  buttonDisabled: {
    opacity: 0.4,
  },

  /* Request access */
  requestAccess: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.text.muted,
    textAlign: "center",
    lineHeight: 24,
  },
  requestLink: {
    fontWeight: "500",
    color: colors.text.primary,
  },

  /* Terms */
  terms: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.text.muted,
    textAlign: "center",
    lineHeight: 16,
  },

  /* Error */
  error: {
    fontSize: 14,
    color: colors.status.error,
    textAlign: "center",
  },

  /* DEV section */
  devSection: {
    gap: spacing.s8,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: spacing.s16,
    marginTop: spacing.s8,
  },
  devLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.text.muted,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.surface.level1,
    borderRadius: radius.r12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.s12,
    fontSize: 16,
    color: colors.text.primary,
  },
  devButton: {
    height: 44,
    borderRadius: radius.r12,
    backgroundColor: colors.text.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  devButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.onAccent,
  },
});
