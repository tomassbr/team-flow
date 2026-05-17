import { Tabs } from "expo-router";
import { colors } from "@team-flow/shared";
import { GradientTabBarIcon, GradientTabLabel } from "@/components/ui/GradientTabIcon";

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
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <GradientTabBarIcon name="grid-outline" focused={focused} />
          ),
          tabBarLabel: ({ focused }) => (
            <GradientTabLabel label="Desks" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard/book"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="reservations/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <GradientTabBarIcon name="calendar-outline" focused={focused} />
          ),
          tabBarLabel: ({ focused }) => (
            <GradientTabLabel label="My Bookings" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <GradientTabBarIcon name="person-outline" focused={focused} />
          ),
          tabBarLabel: ({ focused }) => (
            <GradientTabLabel label="Settings" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin/desks"
        options={{ href: null }}
      />
    </Tabs>
  );
}
