import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "@team-flow/shared";

// Minimal shape of @react-navigation/bottom-tabs BottomTabBarProps
// (package is nested inside expo-router, not a direct dependency).
interface TabBarProps {
  state: {
    index: number;
    routes: { key: string; name: string; params?: object }[];
  };
  navigation: {
    emit: (e: { type: "tabPress"; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string, params?: object) => void;
  };
}

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

/** Extra bottom padding screens need so scroll content clears the floating bar. */
export const TAB_BAR_CLEARANCE = 88;

interface TabConfig {
  route: string;
  label: string;
  icon: IoniconName;
  iconActive: IoniconName;
}

const TABS: TabConfig[] = [
  { route: "dashboard/index", label: "Home", icon: "home-outline", iconActive: "home" },
  { route: "reservations/index", label: "My Bookings", icon: "calendar-outline", iconActive: "calendar" },
  { route: "settings/index", label: "Settings", icon: "settings-outline", iconActive: "settings" },
];

/**
 * Floating pill tab bar — mirror of the Figma TabBar component.
 * White rounded bar floating above content, active tab gets a soft
 * indigo pill with icon + label, inactive tabs show a muted icon only.
 */
export function FloatingTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing.s12) }]}
    >
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.route);
          if (routeIndex === -1) return null;
          const route = state.routes[routeIndex];
          const focused = state.index === routeIndex;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
              style={[styles.tab, focused && styles.tabActive]}
            >
              <Ionicons
                name={focused ? tab.iconActive : tab.icon}
                size={20}
                color={focused ? colors.accent.primary : colors.text.muted}
              />
              {focused && <Text style={styles.label}>{tab.label}</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingHorizontal: spacing.s16,
  },
  bar: {
    flexDirection: "row",
    alignSelf: "stretch",
    height: 56,
    padding: 6,
    borderRadius: radius.r28,
    backgroundColor: colors.surface.level1,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 22,
  },
  tabActive: {
    backgroundColor: colors.accent.primaryBg,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.accent.primary,
  },
});
