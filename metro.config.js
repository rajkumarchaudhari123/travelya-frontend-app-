// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Option A (v4 style, explicit CSS entry):
module.exports = withNativeWind(config, { input: "./global.css" });

// Option B (v5 style, defaults):
// module.exports = withNativeWind(config);
