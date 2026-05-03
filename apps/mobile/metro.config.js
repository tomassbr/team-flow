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

module.exports = config;
