import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, gradient } from "@team-flow/shared";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

// ─── Icon only (for tabBarIcon) ────────────────────────────────────────────

interface GradientTabBarIconProps {
  name: IoniconName;
  focused: boolean;
  size?: number;
}

export function GradientTabBarIcon({ name, focused, size = 22 }: GradientTabBarIconProps) {
  if (!focused) {
    return <Ionicons name={name} size={size} color={colors.text.muted} />;
  }
  return (
    <MaskedView
      style={{ width: size, height: size }}
      maskElement={
        <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={name} size={size} color="#000" />
        </View>
      }
    >
      <LinearGradient
        colors={gradient.brand.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: size, height: size }}
      />
    </MaskedView>
  );
}

// ─── Label only (for tabBarLabel) ──────────────────────────────────────────

interface GradientTabLabelProps {
  label: string;
  focused: boolean;
}

export function GradientTabLabel({ label, focused }: GradientTabLabelProps) {
  if (!focused) {
    return <Text style={styles.labelInactive}>{label}</Text>;
  }
  // Gradient text: ghost Text drives size, LinearGradient fills absoluteFill,
  // maskElement Text defines which pixels are opaque.
  return (
    <MaskedView
      maskElement={<Text style={styles.labelMask}>{label}</Text>}
    >
      <Text style={styles.labelGhost}>{label}</Text>
      <LinearGradient
        colors={gradient.brand.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </MaskedView>
  );
}

// ─── Legacy combined component (kept for compat) ───────────────────────────

interface GradientTabIconProps {
  name: IoniconName;
  label: string;
  focused: boolean;
  size?: number;
}

/** @deprecated Use GradientTabBarIcon + GradientTabLabel separately */
export function GradientTabIcon({ name, label, focused, size = 22 }: GradientTabIconProps) {
  return (
    <View style={styles.container}>
      <GradientTabBarIcon name={name} focused={focused} size={size} />
      <GradientTabLabel label={label} focused={focused} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 2,
    paddingTop: 4,
  },
  labelInactive: {
    fontSize: 10,
    fontWeight: "500",
    lineHeight: 13,
    color: colors.text.muted,
    textAlign: "center",
  },
  labelMask: {
    fontSize: 10,
    fontWeight: "500",
    lineHeight: 13,
    color: "#000",
    textAlign: "center",
  },
  labelGhost: {
    fontSize: 10,
    fontWeight: "500",
    lineHeight: 13,
    color: "transparent",
    textAlign: "center",
  },
});
