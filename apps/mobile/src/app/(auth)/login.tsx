import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { authService } from "@/features/auth/authService";
import { useAuthStore } from "@/store";
import { colors, spacing, radius } from "@team-flow/shared";

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
      setError(msg.includes("abort") ? "Request timed out. Is the dev server running on port 3000?" : "Sign in failed. Check the server.");
    } finally {
      setDevLoading(false);
    }
  }

  async function hydrateSession() {
    const session = await authService.getSession();
    if (session) {
      setSession(session);
      router.replace(session.companyId ? "/(app)/dashboard" : "/(auth)/onboarding");
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <View style={styles.logoMark}>
            <Text variant="h1" color="onAccent">TF</Text>
          </View>
          <Text variant="display">Team Flow</Text>
          <Text variant="body" color="secondary">
            Desk booking for hybrid teams
          </Text>
        </View>

        <Button
          variant="primary"
          label="Continue with Google"
          fullWidth
          loading={googleLoading}
          disabled={anyLoading}
          onPress={handleGoogleSignIn}
        />

        {/* Apple Sign In — required by App Store guidelines (section 4.8)
            when any third-party social login is offered on iOS */}
        {Platform.OS === "ios" && (
          <View style={{ opacity: anyLoading ? 0.4 : 1 }}>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={radius.r16}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          </View>
        )}

        {__DEV__ && (
          <View style={styles.devSection}>
            <Text variant="micro" color="muted" style={styles.devLabel}>
              DEV ONLY — Credentials
            </Text>
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
            <Button
              variant="secondary"
              label="Sign in (dev)"
              fullWidth
              loading={devLoading}
              disabled={anyLoading}
              onPress={handleDevSignIn}
            />
          </View>
        )}

        {error && (
          <Text variant="caption" color="muted" style={styles.error}>
            {error}
          </Text>
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
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.s24,
    gap: spacing.s16,
  },
  brand: {
    alignItems: "center",
    gap: spacing.s12,
    marginBottom: spacing.s32,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: radius.r20,
    backgroundColor: colors.accent.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.s8,
  },
  appleButton: {
    width: "100%",
    height: 48,
  },
  devSection: {
    gap: spacing.s8,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: spacing.s16,
    marginTop: spacing.s8,
  },
  devLabel: {
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
  error: {
    textAlign: "center",
    color: colors.status.error,
  },
});
