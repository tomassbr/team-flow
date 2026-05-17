import React from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
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

  const cardContent = (
    <>
      {/* Horní řada */}
      <View style={styles.topRow}>
        {isBooked ? (
          <View style={styles.avatarWrap}>
            <Avatar name={user ?? "?"} src={userImage} size={40} />
          </View>
        ) : (
          <View style={styles.iconWrap}>
            <Ionicons name="desktop-outline" size={18} color="#63748C" />
          </View>
        )}

        {isBooked && (
          <View style={styles.badgeBooked}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeTextBooked}>Booked</Text>
          </View>
        )}
      </View>

      {/* Dolní řada */}
      <View style={styles.bottomRow}>
        <Text style={styles.deskName} numberOfLines={1}>{name}</Text>
        {isBooked ? (
          <Text style={styles.userName} numberOfLines={1}>{user ?? ""}</Text>
        ) : (
          <View style={styles.badgeAvailable}>
            <View style={styles.availableDot} />
            <Text style={styles.badgeTextAvailable}>Available</Text>
          </View>
        )}
      </View>
    </>
  );

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        if (onPress) scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      disabled={isBooked || !onPress}
      style={[animatedStyle, style]}
    >
      {isBooked ? (
        <LinearGradient
          colors={["rgba(199,210,254,0.6)", "rgba(207,250,254,0.4)", "rgba(255,255,255,0.2)"]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={[styles.card, styles.cardBooked]}
        >
          {cardContent}
        </LinearGradient>
      ) : (
        <View style={[styles.card, styles.cardAvailable]}>
          {cardContent}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.r28,
    padding: spacing.s24,
    minHeight: 180,
    justifyContent: "space-between",
  },
  cardAvailable: {
    backgroundColor: "rgba(255,255,255,0.97)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    ...rnShadows.e2,
  },
  cardBooked: {
    borderWidth: 1,
    borderColor: "rgba(199,210,254,0.4)",
    ...rnShadows.e2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  avatarWrap: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,1)",
    borderRadius: radius.full,
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
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.6)",
    ...rnShadows.e1,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.accent.primary,
  },
  badgeTextBooked: {
    fontSize: 12,
    color: colors.accent.primary,
  },
  bottomRow: {
    gap: spacing.s8,
  },
  deskName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
    lineHeight: 22,
  },
  userName: {
    fontSize: 12,
    color: colors.accent.primary,
    lineHeight: 16,
  },
  badgeAvailable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: "rgba(236,253,245,0.8)",
    borderWidth: 1,
    borderColor: "rgba(167,243,208,0.5)",
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: "#34D399",
  },
  badgeTextAvailable: {
    fontSize: 12,
    color: "#059669",
  },
});
