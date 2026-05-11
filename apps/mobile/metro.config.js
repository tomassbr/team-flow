/**
 * Metro config for monorepo.
 *
 * LEARNING: Metro is React Native's JavaScript bundler (like webpack for web).
 * By default, Metro only watches files in its own project directory. In a
 * monorepo, packages live OUTSIDE the app directory (e.g. ../../packages/shared).
 * We must tell Metro to watch those folders too.
 *
 * Without this config, importing '@team-flow/shared' would throw:
 *   "Unable to resolve module @team-flow/shared"
 */
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo (packages/ directory)
config.watchFolders = [workspaceRoot];

// Look for modules in both the app's node_modules and the root node_modules.
// npm workspaces hoists packages to the root — Metro needs to find them there.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Force ALL react imports (including from inside react-native renderer) to the
// same file. react-native is hoisted to workspaceRoot/node_modules, so its
// renderer resolves 'react' via standard Node resolution to workspaceRoot/node_modules/react
// (a different instance than apps/mobile/node_modules/react). This causes
// "Cannot read property 'useMemo' of null" — the dispatcher set by the renderer
// is invisible to our react package because they share different internals objects.
//
// resolveRequest is checked BEFORE standard resolution and BEFORE extraNodeModules,
// so it's the only reliable way to force a single react instance across all modules.
const reactDedup = {
  react: path.resolve(projectRoot, "node_modules/react/index.js"),
  "react/jsx-runtime": path.resolve(projectRoot, "node_modules/react/jsx-runtime.js"),
  "react/jsx-dev-runtime": path.resolve(projectRoot, "node_modules/react/jsx-dev-runtime.js"),
};

// expo-router's _ctx files use `process.env.EXPO_ROUTER_APP_ROOT` which Metro
// cannot substitute (it's not transformed by Babel from node_modules).
// We redirect them to local files with the hardcoded "app" directory path.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.includes("expo-router/_ctx")) {
    const suffix = moduleName.endsWith(".android")
      ? "_ctx.android.js"
      : moduleName.endsWith(".ios")
      ? "_ctx.ios.js"
      : "_ctx.js";
    return {
      filePath: path.resolve(projectRoot, "src", suffix),
      type: "sourceFile",
    };
  }
  if (reactDedup[moduleName]) {
    return { filePath: reactDedup[moduleName], type: "sourceFile" };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
