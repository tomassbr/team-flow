/**
 * module-resolver maps '@/' to 'src/' so route files can import like:
 *   import { Button } from '@/components/ui/Button'
 * instead of messy relative paths like '../../../components/ui/Button'.
 *
 * Expo Router app directory: uses `app/` symlink → src/app (no env var needed).
 */
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
