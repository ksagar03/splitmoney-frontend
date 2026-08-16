const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const os = require("os");

const config = getDefaultConfig(__dirname);

// --- WORKAROUND FOR NATIVEWIND WINDOWS PATH BUG ---
// this workarounds only apply to local windows dev, where a space in the project path will break the NativeWind's Cli Command
// if we try to deploy to vercel which uses linux build environment this changes wont work as it won't have this kind of path in github
const isWindows = os.platform === "win32" || "win64";

if (isWindows) {
  const originalResolveRequest = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    // If Metro receives the mangled unescaped string, redirect it to the correct path
    if (
      moduleName.includes("ode_modules.cache") &&
      moduleName.includes("ativewind")
    ) {
      const correctedPath = path.resolve(
        __dirname,
        "node_modules/.cache/nativewind/global.css",
      );

      return originalResolveRequest
        ? originalResolveRequest(context, correctedPath, platform)
        : context.resolveRequest(context, correctedPath, platform);
    }

    return originalResolveRequest
      ? originalResolveRequest(context, moduleName, platform)
      : context.resolveRequest(context, moduleName, platform);
  };
}

// NOTE: cliCommand is overridden with a *relative* path on purpose, but only for windows. The project
// lives under a folder containing a space ("splitmoney FE"), and NativeWind builds
// its default cliCommand from an absolute path then does `cliCommand.split(" ")`,
// which breaks the path at the space and makes the Tailwind CLI fail to start.
// A relative path has no space and resolves from the project root Metro runs in.
module.exports = withNativeWind(config, {
  input: "./global.css",
  ...(isWindows && { cliCommand: "node node_modules/tailwindcss/lib/cli.js" }),
});
