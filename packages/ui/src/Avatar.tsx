/**
 * Shared Avatar component — works on both React Native and web (via react-native-web).
 *
 * Shows user's profile image, falling back to initials if no image is provided.
 *
 * On mobile:  Image + View from react-native
 * On web:     react-native-web maps Image → <img>, View → <div>
 *
 * Usage:
 *   <Avatar name="Jan Novák" imageUrl="https://..." size={40} />
 *   <Avatar name="Jana" />  ← shows "J" initial
 */
import React from "react";
import { View, Image, StyleSheet, ViewStyle, ImageStyle } from "react-native";
import { colors, typography } from "@team-flow/shared";
import { Text } from "./Text";

export interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: number;
  /** Applied to the outer container (View or Image). */
  style?: ViewStyle;
}

export function Avatar({ name, imageUrl, size = 36, style }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase();
  const borderRadius = size / 2;

  if (imageUrl) {
    // ImageStyle is distinct from ViewStyle in RN's type system
    const imageStyle: ImageStyle = { width: size, height: size, borderRadius };
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, imageStyle]}
        accessibilityLabel={name}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius },
        style,
      ]}
    >
      <Text
        style={[
          typography.caption,
          { color: colors.text.onAccent, lineHeight: size },
        ]}
      >
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surface.level2,
  },
  placeholder: {
    backgroundColor: colors.accent.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
