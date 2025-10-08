module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }], // Configure JSX for NativeWind
      "nativewind/babel",  // This is for enabling NativeWind styling in your React Native project
    ],
    plugins: [
      // other plugins you may have
      "react-native-worklets/plugin",  // Reanimated worklets plugin, must be last
    ],
  };
};
