// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add .wasm to asset extensions so Metro can bundle SQLite WASM for web
config.resolver.assetExts.push('wasm');

module.exports = config;
