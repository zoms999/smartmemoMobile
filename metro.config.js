const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Node.js 모듈 polyfill 추가
config.resolver.alias = {
  ...config.resolver.alias,
  stream: 'stream-browserify',
  buffer: '@craftzdog/react-native-buffer',
  crypto: 'react-native-crypto',
};

// polyfill 모듈들 추가
config.resolver.nodeModulesPaths = [
  ...config.resolver.nodeModulesPaths,
  'node_modules',
];

// node-libs-react-native에서 제공하는 모듈을 추가합니다.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...require('node-libs-react-native'),
};

module.exports = config; 