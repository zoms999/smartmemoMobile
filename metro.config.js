const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// React Native Web 지원을 위한 설정 추가
defaultConfig.resolver.alias = {
  'react-native': 'react-native-web',
  ...defaultConfig.resolver.alias,
};

defaultConfig.resolver.extensions = [
  '.web.tsx',
  '.web.ts',
  '.web.jsx',
  '.web.js',
  ...defaultConfig.resolver.extensions,
];

module.exports = defaultConfig; 