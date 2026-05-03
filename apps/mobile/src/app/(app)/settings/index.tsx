import React from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { useCompanyQuery } from "@/features/company/useCompanyQuery";
import { useAuthStore } from "@/store";
import { authService } from "@/features/auth/authService";
import { colors, spacing } from "@team-flow/shared";

export default function SettingsScreen() {
  const { name, email, image, role, clearSession } = useAuthStore();
  const { data: company } = useCompanyQuery();

  async function handleSignOut() {
    await authService.signOut();
    clearSession();
    router.replace("/(auth)/login");
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="h1" style={styles.title}>
          Settings
        </Text>

        {/* Profile */}
        <Card>
          <View style={styles.profileRow}>
            <Avatar src={image} name={name ?? undefined} size={56} />
            <View style={styles.profileInfo}>
              <Text variant="bodyStrong">{name ?? "Unknown"}</Text>
              <Text variant="caption" color="secondary">
                {email}
              </Text>
              <Text variant="micro" color="muted">
                {role}
              </Text>
            </View>
          </View>
        </Card>

        {/* Company */}
        {company && (
          <Card>
            <View style={styles.section}>
              <Text variant="micro" color="muted">
                WORKSPACE
              </Text>
              <Text variant="bodyStrong">{company.name}</Text>
              <View style={styles.planRow}>
                <Text variant="caption" color="secondary">
                  Plan:
                </Text>
                <Text
                  variant="caption"
                  style={{
                    color:
                      company.plan === "PRO"
                        ? colors.status.success
                        : colors.text.secondary,
                  }}
                >
                  {company.plan}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Sign out */}
        <Button
          variant="secondary"
          label="Sign out"
          fullWidth
          onPress={handleSignOut}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  content: {
    padding: spacing.s24,
    gap: spacing.s16,
    paddingBottom: spacing.s40,
  },
  title: {
    marginBottom: spacing.s8,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s16,
  },
  profileInfo: {
    flex: 1,
    gap: spacing.s4,
  },
  section: {
    gap: spacing.s8,
  },
  planRow: {
    flexDirection: "row",
    gap: spacing.s4,
  },
});
