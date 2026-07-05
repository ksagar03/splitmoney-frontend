module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel", // v4: nativewind/babel is a PRESET, not a plugin
    ],
    plugins: [
      "react-native-reanimated/plugin", // Must be last
    ],
  };
};