/**
 * LEARNING — babel.config.js in React Native:
 * Babel transforms your TypeScript/JSX into plain JavaScript that the JS engine
 * can run. babel-preset-expo includes all needed transforms for Expo apps.
 *
 * FIX: expo-router needs EXPO_ROUTER_APP_ROOT set as a static string BEFORE
 * babel-preset-expo runs, so Metro's require.context() can resolve it.
 * Setting it here (top-level, outside the function) ensures it's available
 * when babel-preset-expo substitutes the env var in expo-router's _ctx files.
 *
 * module-resolver maps '@/' to 'src/' so route files can import like:
 *   import { Button } from '@/components/ui/Button'
 * instead of messy relative paths like '../../../components/ui/Button'.
 */
process.env.EXPO_ROUTER_APP_ROOT = "src/app";

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@": "./src",
          },
        },
      ],
      "react-native-reanimated/plugin", // must be last
    ],
  };
};
