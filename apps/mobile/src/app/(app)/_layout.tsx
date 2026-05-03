import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { colors, spacing } from "@team-flow/shared";

function DashboardIcon({ color }: { color: string }) {
  return (
    <View style={[styles.iconDot, { backgroundColor: color, borderRadius: 4 }]} />
  );
}

function BookingsIcon({ color }: { color: string }) {
  return (
    <View style={[styles.iconDot, { backgroundColor: color, borderRadius: 8 }]} />
  );
}

function SettingsIcon({ color }: { color: string }) {
  return (
    <View style={[styles.iconDot, { backgroundColor: color, borderRadius: 2 }]} />
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.surface.level1,
          borderTopColor: colors.border.subtle,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: "Desks",
          tabBarIcon: ({ color }) => <DashboardIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard/book"
        options={{
          href: null, // hidden from tab bar — opened programmatically
        }}
      />
      <Tabs.Screen
        name="reservations/index"
        options={{
          title: "My Bookings",
          tabBarIcon: ({ color }) => <BookingsIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconDot: {
    width: 20,
    height: 20,
    marginBottom: spacing.s4,
  },
});
