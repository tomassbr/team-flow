import React from "react";
import { View, Image, Text as RNText } from "react-native";
import { makeStyleSheet } from "@/theme";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 24 | 32 | 40 | 56;
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const useStyles = makeStyleSheet((theme) => ({
  fallback: {
    backgroundColor: theme.colors.accent.primaryBg,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  initials: {
    color: theme.colors.accent.primary,
    fontWeight: "600" as const,
  },
  image: {
    backgroundColor: theme.colors.surface.level2,
  },
}));

export function Avatar({ src, name, size = 40 }: AvatarProps) {
  const styles = useStyles();
  const sizeStyle = { width: size, height: size, borderRadius: size / 2 };
  const fontSize = size * 0.35;

  if (src) {
    return <Image source={{ uri: src }} style={[styles.image, sizeStyle]} />;
  }

  return (
    <View style={[styles.fallback, sizeStyle]}>
      <RNText style={[styles.initials, { fontSize }]}>
        {name ? getInitials(name) : "?"}
      </RNText>
    </View>
  );
}
