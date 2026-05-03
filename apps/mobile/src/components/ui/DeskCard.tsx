import React from "react";
import { Pressable, View, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Text } from "./Text";
import { StatusChip } from "./StatusChip";
import { Avatar } from "./Avatar";
import { makeStyleSheet } from "@/theme";
import type { DeskStatus } from "@team-flow/shared";

interface DeskCardProps {
  name: string;
  status: DeskStatus;
  user?: string;
  userImage?: string | null;
  onPress?: () => void;
  style?: ViewStyle;
}

const useStyles = makeStyleSheet((theme) => ({
  card: {
    backgroundColor: theme.colors.surface.level1,
    borderRadius: theme.radius.r24,
    padding: theme.spacing.s16,
    gap: theme.spacing.s12,
    ...theme.shadows.e1,
  },
  cardBooked: {
    backgroundColor: theme.colors.surface.elevated,
  },
  header: {
    gap: theme.spacing.s8,
  },
  userRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: theme.spacing.s8,
  },
  userName: {
    flex: 1,
  },
}));

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function DeskCard({ name, status, user, userImage, onPress, style }: DeskCardProps) {
  const styles = useStyles();
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
      <View style={[styles.card, isBooked && styles.cardBooked]}>
        <View style={styles.header}>
          <Text variant="bodyStrong" numberOfLines={1}>{name}</Text>
          <StatusChip status={status} />
        </View>
        {isBooked && user && (
          <View style={styles.userRow}>
            <Avatar name={user} src={userImage} size={32} />
            <Text variant="caption" color="secondary" numberOfLines={1} style={styles.userName}>
              {user}
            </Text>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}
