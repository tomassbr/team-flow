import React from "react";
import { Pressable, View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { Avatar } from "./Avatar";
import { colors, spacing, radius, rnShadows } from "@team-flow/shared";
import type { DeskStatus } from "@team-flow/shared";

interface DeskCardProps {
  name: string;
  status: DeskStatus;
  user?: string;
  userImage?: string | null;
  onPress?: () => void;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function DeskCard({ name, status, user, userImage, onPress, style }: DeskCardProps) {
  const scale = useSharedValue(1);
  const isBooked = status === "booked";

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      disabled={isBooked || !onPress}
      style={[animatedStyle, style]}
    >
      <View style={[styles.card, isBooked ? styles.cardBooked : styles.cardAvailable]}>
        {/* Top row: icon/avatar + status badge */}
        <View style={styles.topRow}>
          {isBooked ? (
            <Avatar name={user ?? "?"} src={userImage} size={40} />
          ) : (
            <View style={styles.iconWrap}>
              <Ionicons name="desktop-outline" size={18} color="#63748C" />
            </View>
          )}

          {isBooked ? (
            <View style={styles.badgeBooked}>
              <View style={styles.badgeDot} />
              <Text variant="micro" style={styles.badgeTextBooked}>Booked</Text>
            </View>
          ) : (
            <View style={styles.badgeAvailable}>
              <Text variant="micro" style={styles.badgeTextAvailable}>Available</Text>
            </View>
          )}
        </View>

        {/* Bottom row: desk name + occupant */}
        <View style={styles.bottomRow}>
          <Text variant="bodyStrong" numberOfLines={1}>{name}</Text>
          {isBooked && user ? (
            <Text variant="micro" color="secondary" numberOfLines={1}>{user}</Text>
          ) : null}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.r24,
    padding: spacing.s16,
    minHeight: 148,
    justifyContent: "space-between",
    ...rnShadows.e3,
  },
  cardAvailable: {
    backgroundColor: "rgba(255,255,255,0.97)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },
  // Approximation of web gradient: linear-gradient(135deg, #C6D1FF → #CFFAFF → #FFF)
  cardBooked: {
    backgroundColor: "#D8E3FF",
    borderWidth: 1,
    borderColor: "rgba(198,209,255,0.6)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,1)",
    alignItems: "center",
    justifyContent: "center",
    ...rnShadows.e1,
  },
  badgeBooked: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s4,
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s4,
    borderRadius: radius.full,
    backgroundColor: "rgba(237,241,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(198,209,255,0.6)",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.accent.primary,
  },
  badgeTextBooked: {
    color: colors.accent.primary,
  },
  badgeAvailable: {
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s4,
    borderRadius: radius.full,
    backgroundColor: "rgba(237,253,244,0.9)",
    borderWidth: 1,
    borderColor: "rgba(166,243,208,0.5)",
  },
  badgeTextAvailable: {
    color: "#059669",
  },
  bottomRow: {
    gap: spacing.s4,
  },
});
