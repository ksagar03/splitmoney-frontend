const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// NOTE: cliCommand is overridden with a *relative* path on purpose. The project
// lives under a folder containing a space ("splitmoney FE"), and NativeWind builds
// its default cliCommand from an absolute path then does `cliCommand.split(" ")`,
// which breaks the path at the space and makes the Tailwind CLI fail to start.
// A relative path has no space and resolves from the project root Metro runs in.
module.exports = withNativeWind(config, {
  input: "./global.css",
  cliCommand: "node node_modules/tailwindcss/lib/cli.js",
});