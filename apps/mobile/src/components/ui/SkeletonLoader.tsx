import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
} from "react-native-reanimated";
import { makeStyleSheet } from "@/theme";

const useStyles = makeStyleSheet((theme) => ({
  grid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    padding: theme.spacing.s16,
    gap: theme.spacing.s12,
  },
  cell: { width: "47%" as const },
  card: {
    backgroundColor: theme.colors.surface.level2,
    borderRadius: theme.radius.r24,
    padding: theme.spacing.s16,
    gap: theme.spacing.s12,
    minHeight: 100,
  },
  titleLine: {
    height: 16,
    backgroundColor: theme.colors.border.strong,
    borderRadius: theme.radius.r12,
    width: "70%" as const,
  },
  subtitleLine: {
    height: 12,
    backgroundColor: theme.colors.border.subtle,
    borderRadius: theme.radius.r12,
    width: "50%" as const,
  },
}));

function SkeletonCard() {
  const styles = useStyles();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.4, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1, true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={styles.titleLine} />
      <View style={styles.subtitleLine} />
    </Animated.View>
  );
}

export function SkeletonLoader({ count = 6 }: { count?: number }) {
  const styles = useStyles();
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.cell}><SkeletonCard /></View>
      ))}
    </View>
  );
}
