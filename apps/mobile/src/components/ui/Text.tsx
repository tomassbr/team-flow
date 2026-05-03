/**
 * Re-exports the shared Text component from @team-flow/ui.
 *
 * Text is a pure primitive (RNText + typography tokens) with no platform-specific
 * dependencies, so it can be shared across web and mobile without modification.
 *
 * If you need mobile-specific behavior (e.g. custom font scaling), wrap or
 * extend the shared component here rather than modifying the package.
 */
export { Text } from "@team-flow/ui";
export type { TextProps } from "@team-flow/ui";
