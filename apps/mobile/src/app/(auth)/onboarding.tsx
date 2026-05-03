import React, { useState } from "react";
import { View, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/apiClient";
import { useAuthStore } from "@/store";
import { authService } from "@/features/auth/authService";
import { colors, spacing, radius } from "@team-flow/shared";

export default function OnboardingScreen() {
  const { setSession } = useAuthStore();
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    const name = companyName.trim();
    if (name.length < 1) {
      setError("Company name cannot be empty.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.company.create(name);
      // Refresh session to get the new companyId
      const session = await authService.getSession();
      if (session) {
        setSession(session);
        router.replace("/(app)/dashboard");
      }
    } catch {
      setError("Failed to create workspace. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="display">Create your workspace</Text>
          <Text variant="body" color="secondary">
            You'll be the admin. Invite your team after setup.
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="e.g. Acme Inc."
          value={companyName}
          onChangeText={(t) => {
            setCompanyName(t);
            setError(null);
          }}
          maxLength={100}
          autoFocus
          placeholderTextColor={colors.text.muted}
        />

        {error && (
          <Text variant="caption" style={{ color: colors.status.error }}>
            {error}
          </Text>
        )}

        <Button
          variant="gradient"
          label="Create workspace"
          fullWidth
          loading={loading}
          disabled={companyName.trim().length === 0}
          onPress={handleCreate}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  content: {
    flex: 1,
    padding: spacing.s24,
    justifyContent: "center",
    gap: spacing.s16,
  },
  header: {
    gap: spacing.s8,
    marginBottom: spacing.s16,
  },
  input: {
    backgroundColor: colors.surface.level1,
    borderRadius: radius.r12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.s16,
    fontSize: 16,
    color: colors.text.primary,
  },
});
