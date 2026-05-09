const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Apollo Client 4 uses ESM package exports — enable Metro to resolve them correctly
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
